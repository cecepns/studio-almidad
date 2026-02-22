import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// const API_BASE_URL = 'https://api-inventory.isavralabel.com/denko/api';
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://api-inventory.isavralabel.com/almidad/api';
const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Helper untuk membentuk URL penuh dari path image (misalnya "/uploads/xxx.jpg")
export const getImageUrl = (path) => {
  if (!path) return '';
  // Jika sudah full URL (http/https), langsung kembalikan
  if (/^https?:\/\//i.test(path)) return path;
  // Pastikan path diawali dengan slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${FILE_BASE_URL}${normalizedPath}`;
};

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making another request.');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
};

// Products endpoints
export const productsAPI = {
  getAll: (page = 1, limit = 10, search = '', categoryId = '', subcategoryId = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search || '',
    });
    if (categoryId) params.append('category_id', categoryId);
    if (subcategoryId) params.append('subcategory_id', subcategoryId);
    return api.get(`/products?${params.toString()}`);
  },
  getBySlug: (slug) => api.get(`/products/${slug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Banners endpoints
export const bannersAPI = {
  getAll: () => api.get('/banners'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

// Settings endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Upload endpoints
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadQuillImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/quill-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Categories endpoints
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getSubcategories: (categoryId) => api.get(`/subcategories/${categoryId}`),
  // Admin endpoints
  getAllAdmin: () => api.get('/admin/categories'),
  getAllSubcategoriesAdmin: (categoryId) => 
    api.get(`/admin/subcategories${categoryId ? `?category_id=${categoryId}` : ''}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
  createSubcategory: (data) => api.post('/admin/subcategories', data),
  updateSubcategory: (id, data) => api.put(`/admin/subcategories/${id}`, data),
  deleteSubcategory: (id) => api.delete(`/admin/subcategories/${id}`),
};

export default api;