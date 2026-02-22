import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import { Search, Plus, Edit2, Trash2, Eye, Filter, X } from 'lucide-react';
import { productsAPI, categoriesAPI, getImageUrl } from '../../utils/api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchSubcategories = useCallback(async (categoryId) => {
    try {
      const response = await categoriesAPI.getSubcategories(categoryId);
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll(
        currentPage, 
        10, 
        searchTerm, 
        selectedCategory, 
        selectedSubcategory
      );
      setServices(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedSubcategory]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory, fetchSubcategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setCurrentPage(1);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    try {
      await productsAPI.delete(serviceToDelete.id);
      setServices(services.filter(service => service.id !== serviceToDelete.id));
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Layanan</h1>
          <Link
            to="/admin/services/create"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Layanan</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cari
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!selectedCategory}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Semua Subkategori</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {services.length} layanan ditemukan
                </span>
              </div>

              {(searchTerm || selectedCategory || selectedSubcategory) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Hapus Filter</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada layanan ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah kata kunci pencarian atau filter yang digunakan.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Layanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {service.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getImageUrl(service.image)}
                                alt={service.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">🚧</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {service.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.category?.name || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.subcategory?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.price ? `Rp ${service.price.toLocaleString('id-ID')}` : 'Hubungi Kami'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.featured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.featured ? 'Unggulan' : 'Biasa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/services/${service.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/services/${service.slug}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                            title="Lihat"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(service)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * 10, services.length)}</span> of{' '}
                      <span className="font-medium">{services.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Hapus Layanan
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus layanan &quot;{serviceToDelete?.name}&quot;? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                  </button>
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
