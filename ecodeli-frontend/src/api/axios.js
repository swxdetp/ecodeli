import axios from 'axios';

// Utiliser le proxy Vite configuré dans vite.config.js
// Au lieu de 'http://localhost:8000/api', on utilise simplement '/api'
const API_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecodeli_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Vérifier si un token existe déjà
      const hasToken = !!localStorage.getItem('ecodeli_token');
      
      // Ne nettoyer le stockage et ne rediriger que si un token existait déjà
      // Ce qui signifie que l'utilisateur était connecté mais que son token a expiré
      if (hasToken) {
        localStorage.removeItem('ecodeli_token');
        localStorage.removeItem('ecodeli_user');
        window.location.href = '/login';
      }
      // Si aucun token n'existait, c'est juste une tentative d'accès à une ressource protégée
      // par un utilisateur non connecté, ce qui est normal et ne nécessite aucune action spéciale
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
