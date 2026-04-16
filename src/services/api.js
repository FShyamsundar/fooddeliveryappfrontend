import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const addAddress = (data) => API.post('/auth/address', data);
export const toggleFavorite = (id) => API.post(`/auth/favorite/${id}`);

// Restaurants
export const getRestaurants = (params) => API.get('/restaurants', { params });
export const getRestaurantById = (id) => API.get(`/restaurants/${id}`);
export const getRestaurantMenu = (id) => API.get(`/restaurants/${id}/menu`);
export const createRestaurant = (data) => API.post('/restaurants', data);
export const updateRestaurant = (id, data) => API.put(`/restaurants/${id}`, data);
export const addMenuItem = (id, data) => API.post(`/restaurants/${id}/menu`, data);
export const updateMenuItem = (id, itemId, data) => API.put(`/restaurants/${id}/menu/${itemId}`, data);
export const deleteMenuItem = (id, itemId) => API.delete(`/restaurants/${id}/menu/${itemId}`);

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getUserOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

// Payments
export const createPaymentIntent = (orderId) => API.post('/payments/create-intent', { orderId });
export const confirmPayment = (data) => API.post('/payments/confirm', data);
export const getPaymentHistory = () => API.get('/payments/history');

// Reviews
export const createReview = (data) => API.post('/reviews', data);
export const getRestaurantReviews = (id) => API.get(`/reviews/restaurant/${id}`);
export const replyToReview = (id, reply) => API.post(`/reviews/${id}/reply`, { reply });
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const getRestaurantOrders = () => API.get('/orders/restaurant');

export default API;
