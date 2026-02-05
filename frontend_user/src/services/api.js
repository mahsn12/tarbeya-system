import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', 
  },
});

// Faculties API
export const facultiesApi = {
  getAll: () => api.get('/faculties'),
  getById: (id) => api.get(`/faculties/${id}`),
};

// Research Topics API
export const researchTopicsApi = {
  getAll: () => api.get('/research-topics'),
  getById: (id) => api.get(`/research-topics/${id}`),
};

// Enrolled Students API (students who are enrolled in the system)
export const enrolledStudentsApi = {
  getAll: () => api.get('/enrolled-students'),
  getById: (id) => api.get(`/enrolled-students/${id}`),
  getByNationalId: (nationalId) => api.get(`/enrolled-students/national/${nationalId}`),
  create: (data) => api.post('/enrolled-students', data),
  update: (id, data) => api.put(`/enrolled-students/${id}`, data),
  delete: (id) => api.delete(`/enrolled-students/${id}`),
};

// Registered Students API (students who registered for research)
export const registeredStudentsApi = {
  getAll: () => api.get('/registered-students'),
  getById: (id) => api.get(`/registered-students/${id}`),
  getByNationalId: (nationalId) => api.get(`/registered-students/national/${nationalId}`),
  getByTeamCode: (teamCode) => api.get(`/registered-students/team/${teamCode}`),
  create: (data) => api.post('/registered-students', data),
  update: (id, data) => api.put(`/registered-students/${id}`, data),
  delete: (id) => api.delete(`/registered-students/${id}`),
};

// Teams API
export const teamsApi = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getByCode: (teamCode) => api.get(`/teams/code/${teamCode}`),
  getByMember: (nationalId) => api.get(`/teams/member/${nationalId}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// Config API
export const configApi = {
  get: () => api.get('/config'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
