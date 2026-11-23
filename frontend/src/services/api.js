import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getProduct: (idOrSlug) => api.get(`/products/${idOrSlug}`),
};

export const categoryService = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (idOrSlug) => api.get(`/categories/${idOrSlug}`),
};

export const wilayaService = {
  getWilayas: (params) => api.get('/wilayas', { params }),
  getWilaya: (id) => api.get(`/wilayas/${id}`),
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  trackOrder: (reference, phone) => api.get('/orders/track', { params: { reference, phone } }),
};

export const couponService = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const adminService = {
  // Products
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImage: (formData) => api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Categories
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Orders
  getOrders: (params) => api.get('/orders/admin/all', { params }),
  getOrder: (id) => api.get(`/orders/admin/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),

  // Inventory
  getInventory: (params) => api.get('/admin/inventory', { params }),
  getMovements: (params) => api.get('/admin/inventory/movements', { params }),
  adjustStock: (data) => api.post('/admin/inventory/adjust', data),

  // Wilayas
  updateWilaya: (id, data) => api.put(`/wilayas/${id}`, data),

  // Coupons
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // Statistics
  getOverview: () => api.get('/admin/statistics/overview'),
  getSalesReports: (params) => api.get('/admin/statistics/sales', { params }),
  getProductReports: () => api.get('/admin/statistics/products'),
};

export default api;
