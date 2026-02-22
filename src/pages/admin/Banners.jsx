import { useState, useEffect } from 'react';
import AOS from 'aos';
import { Plus, PencilIcon as Edit, Trash2, X, Save, MoveUp, MoveDown } from 'lucide-react';
import { bannersAPI, uploadAPI, getImageUrl } from '../../utils/api';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    order_index: 0
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannersAPI.getAll();
      setBanners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || '',
        image: banner.image || '',
        link: banner.link || '',
        order_index: banner.order_index || 0
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        link: '',
        order_index: banners.length
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      order_index: 0
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      // BE returns path e.g. /uploads/xxx.jpg
      const imagePath = response.data.data?.url;
      if (!imagePath) {
        throw new Error('Image URL not found in response');
      }

      setFormData({
        ...formData,
        image: imagePath
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that image is provided only when creating new banner
    if (!editingBanner && !formData.image) {
      alert('Banner image is required');
      return;
    }

    setSaving(true);

    try {
      // Prepare payload with all fields including image URL
      // When editing, use existing image if no new image was uploaded
      const imageUrl = formData.image || (editingBanner ? editingBanner.image : null);
      
      const payload = {
        title: formData.title || null,
        description: formData.description || null,
        image: imageUrl, // Required for create, optional for update
        link: formData.link || null,
        order_index: formData.order_index || 0
      };

      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, payload);
      } else {
        await bannersAPI.create(payload);
      }
      
      fetchBanners();
      closeModal();
      alert(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      await bannersAPI.delete(id);
      fetchBanners();
      alert('Banner deleted successfully!');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
    }
  };

  const moveUp = async (banner, index) => {
    if (index === 0) return;
    
    const newOrder = banners[index - 1].order_index;
    try {
      await bannersAPI.update(banner.id, { ...banner, order_index: newOrder });
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner order:', error);
    }
  };

  const moveDown = async (banner, index) => {
    if (index === banners.length - 1) return;
    
    const newOrder = banners[index + 1].order_index;
    try {
      await bannersAPI.update(banner.id, { ...banner, order_index: newOrder });
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner order:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : banners.length > 0 ? (
          banners.map((banner, index) => (
            <div 
              key={banner.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="relative">
                <img 
                  src={getImageUrl(banner.image) || 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg'} 
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => moveUp(banner, index)}
                    disabled={index === 0}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                    title="Move Up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    onClick={() => moveDown(banner, index)}
                    disabled={index === banners.length - 1}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                    title="Move Down"
                  >
                    <MoveDown size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{banner.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {banner.description || 'No description'}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Order: {banner.order_index}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(banner)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No banners found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field resize-none"
                  placeholder="Enter banner description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image {!editingBanner && '*'}
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                    disabled={uploading}
                    required={!editingBanner}
                  />
                  {uploading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
                  {formData.image && (
                    <img 
                      src={getImageUrl(formData.image)} 
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Index
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    min="0"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{editingBanner ? 'Update' : 'Create'} Banner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;