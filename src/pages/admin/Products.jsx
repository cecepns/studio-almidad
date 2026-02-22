import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import AOS from 'aos';
import { Plus, PencilIcon as Edit, Trash2, Search, Eye, X, Save } from 'lucide-react';
import { productsAPI, uploadAPI, categoriesAPI, getImageUrl } from '../../utils/api';
import Pagination from '../../components/Common/Pagination';
import 'react-quill/dist/quill.snow.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category_id: '',
    subcategory_id: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const quillRef = useRef(null);
  const formDataRef = useRef({
    title: '',
    description: '',
    image: '',
    category_id: '',
    subcategory_id: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll(currentPage, 10, searchTerm);
      const { data, pagination } = response.data;
      
      setProducts(data || []);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await categoriesAPI.getSubcategories(categoryId);
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openModal = async (product = null) => {
    if (product) {
      const newFormData = {
        title: product.title,
        description: product.description,
        image: product.image || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || ''
      };
      setEditingProduct(product);
      setFormData(newFormData);
      formDataRef.current = newFormData;
      if (product.category_id) {
        await fetchSubcategories(product.category_id);
      }
    } else {
      const newFormData = {
        title: '',
        description: '',
        image: '',
        category_id: '',
        subcategory_id: ''
      };
      setEditingProduct(null);
      setFormData(newFormData);
      formDataRef.current = newFormData;
      setSubcategories([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    const newFormData = {
      title: '',
      description: '',
      image: '',
      category_id: '',
      subcategory_id: ''
    };
    setFormData(newFormData);
    formDataRef.current = newFormData;
    setSubcategories([]);
  };

  const handleInputChange = (e) => {
    const newFormData = {
      ...formDataRef.current,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    formDataRef.current = newFormData;
  };

  const handleDescriptionChange = (value) => {
    const newFormData = {
      ...formDataRef.current,
      description: value
    };
    setFormData(newFormData);
    formDataRef.current = newFormData;
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      // Backend now returns relative url (e.g. "/uploads/xxx.jpg")
      const imageUrl = response.data.data?.url || response.data.url;
      
      if (!imageUrl) {
        console.error('No image URL in response:', response.data);
        console.error('Full response:', response);
        alert('Error: No image URL received from server');
        return;
      }
      
      // Update both state and ref
      const newFormData = {
        ...formDataRef.current,
        image: imageUrl
      };
      setFormData(newFormData);
      formDataRef.current = newFormData;
      
      console.log('Image uploaded, URL saved to formData:', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Use ref to get the latest formData (including image URL)
      const payload = {
        title: formDataRef.current.title,
        description: formDataRef.current.description,
        image: formDataRef.current.image || '',
        category_id: formDataRef.current.category_id || null,
        subcategory_id: formDataRef.current.subcategory_id || null
      };
      
      // Log payload to debug
      console.log('Submitting product with payload:', payload);
      console.log('Current formData state:', formData);
      console.log('Current formDataRef:', formDataRef.current);
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
      } else {
        await productsAPI.create(payload);
      }
      
      fetchProducts();
      closeModal();
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.delete(id);
      fetchProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Quill modules configuration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
              setUploading(true);
              const response = await uploadAPI.uploadQuillImage(file);
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', response.data.url);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Error uploading image');
            } finally {
              setUploading(false);
            }
          };
        }
      }
    }
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden" data-aos="fade-up">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={getImageUrl(product.image) || 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg'} 
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">
                              {product.description?.replace(/<[^>]*>/g, '').slice(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {product.category_name && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {product.category_name}
                            </span>
                          )}
                          {product.subcategory_name && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {product.subcategory_name}
                            </span>
                          )}
                          {!product.category_name && !product.subcategory_name && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Uncategorized
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={(e) => {
                      const newFormData = {
                        ...formDataRef.current,
                        category_id: e.target.value,
                        subcategory_id: '' // Reset subcategory when category changes
                      };
                      setFormData(newFormData);
                      formDataRef.current = newFormData;
                    }}
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled={!formData.category_id}
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                    disabled={uploading}
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
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="quill-wrapper">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="bg-white">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ minHeight: '200px' }}
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
                      <span>{editingProduct ? 'Update' : 'Create'} Product</span>
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

export default Products;