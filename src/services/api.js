import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = (username, email, password) => {
  return api.post('/auth/register', { username, email, password });
};

export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const uploadDocument = (file, description, category) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  if (category) formData.append('category', category);

  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAllDocuments = () => {
  return api.get('/documents/all');
};

export const getMyDocuments = () => {
  return api.get('/documents/my');
};

export const getDocumentById = (id) => {
  return api.get(`/documents/${id}`);
};

export const updateDocumentStatus = (id, status, rejectionReason) => {
  return api.put(`/documents/${id}/status`, { status, rejectionReason });
};

export const deleteDocument = (id) => {
  return api.delete(`/documents/${id}`);
};

export const previewDocument = (id) => {
  return api.get(`/documents/${id}/preview`, { responseType: 'blob' });
};

export const searchDocuments = (keyword, status) => {
  let url = '/documents/search?';
  if (keyword) url += `keyword=${keyword}&`;
  if (status) url += `status=${status}`;
  return api.get(url);
};

export const addComment = (documentId, content) => {
  return api.post(`/comments/document/${documentId}`, { content });
};

export const getCommentsByDocument = (documentId) => {
  return api.get(`/comments/document/${documentId}`);
};

export const updateComment = (commentId, content) => {
  return api.put(`/comments/${commentId}`, { content });
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};

export const getNotifications = () => {
  return api.get('/notifications');
};

export const getUnreadCount = () => {
  return api.get('/notifications/unread/count');
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put('/notifications/read-all');
};

export const getAuditLogs = () => {
  return api.get('/audit/logs');
};

export const getAuditLogsByUser = (username) => {
  return api.get(`/audit/logs/user/${username}`);
};

export const getAuditLogsByDocument = (documentId) => {
  return api.get(`/audit/logs/document/${documentId}`);
};

export default api;