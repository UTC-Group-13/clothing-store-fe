import axios from 'axios';
import type { AuthResponse, AuthData, LoginRequest, RegisterRequest } from '../types';

const AUTH_API_BASE_URL = 'http://localhost:8080/api/auth';

const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse<AuthData>> => {
    const response = await authApi.post('/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse<AuthData>> => {
    const response = await authApi.post('/login', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth-storage');
  },
};

export default authApi;

