import { useState, useEffect } from 'react';
import AOS from 'aos';
import { Plus, Edit, Trash2, Search, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { categoriesAPI } from '../../utils/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllAdmin();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await categoriesAPI.getAllSubcategoriesAdmin();
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || '',
        status: category.status
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        status: 'active'
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      status: 'active'
    });
  };

  const openSubcategoryModal = (subcategory = null, categoryId = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryFormData({
        category_id: subcategory.category_id,
        name: subcategory.name,
        description: subcategory.description || '',
        status: subcategory.status
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryFormData({
        category_id: categoryId || '',
        name: '',
        description: '',
        status: 'active'
      });
    }
    setShowSubcategoryModal(true);
  };

  const closeSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
    setSubcategoryFormData({
      category_id: '',
      name: '',
      description: '',
      status: 'active'
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, categoryFormData);
      } else {
        await categoriesAPI.create(categoryFormData);
      }
      
      fetchCategories();
      closeCategoryModal();
      alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingSubcategory) {
        await categoriesAPI.updateSubcategory(editingSubcategory.id, subcategoryFormData);
      } else {
        await categoriesAPI.createSubcategory(subcategoryFormData);
      }
      
      fetchSubcategories();
      closeSubcategoryModal();
      alert(editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert(error.response?.data?.message || 'Error saving subcategory');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? All subcategories will also be deleted.')) return;

    try {
      await categoriesAPI.delete(id);
      fetchCategories();
      fetchSubcategories();
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      await categoriesAPI.deleteSubcategory(id);
      fetchSubcategories();
      alert('Subcategory deleted successfully!');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error deleting subcategory');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return cat.name.toLowerCase().includes(searchLower) ||
           (cat.description && cat.description.toLowerCase().includes(searchLower));
  });

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <button
          onClick={() => openCategoryModal()}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
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

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden" data-aos="fade-up">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category) => {
              const categorySubcategories = getSubcategoriesForCategory(category.id);
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <div key={category.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-grow">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.status}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {categorySubcategories.length} subcategor{categorySubcategories.length !== 1 ? 'ies' : 'y'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubcategoryModal(null, category.id)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        title="Add Subcategory"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && categorySubcategories.length > 0 && (
                    <div className="mt-4 ml-8 space-y-2">
                      {categorySubcategories.map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{subcategory.name}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                subcategory.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {subcategory.status}
                              </span>
                            </div>
                            {subcategory.description && (
                              <p className="text-xs text-gray-600 mt-1">{subcategory.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openSubcategoryModal(subcategory)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={closeCategoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={categoryFormData.status}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCategoryModal}
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
                      <span>{editingCategory ? 'Update' : 'Create'} Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h2>
                <button
                  onClick={closeSubcategoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubcategorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={subcategoryFormData.category_id}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, category_id: e.target.value })}
                  className="input-field"
                  disabled={!!editingSubcategory}
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
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subcategoryFormData.name}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter subcategory name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={subcategoryFormData.description}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter subcategory description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={subcategoryFormData.status}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
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
                      <span>{editingSubcategory ? 'Update' : 'Create'} Subcategory</span>
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

export default Categories;




