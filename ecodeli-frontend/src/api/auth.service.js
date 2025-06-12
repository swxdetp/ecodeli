import api from './axios';

export const AuthService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('ecodeli_token', response.data.token);
      localStorage.setItem('ecodeli_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('ecodeli_token');
    localStorage.removeItem('ecodeli_user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('ecodeli_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  isLoggedIn: () => {
    return !!localStorage.getItem('ecodeli_token');
  }
};

export default AuthService;
