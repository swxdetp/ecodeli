import axios from 'axios';

// Configuration de base d'Axios - Utilisation de l'URL directe du backend
axios.defaults.baseURL = 'http://localhost:8000/api'; // URL directe au lieu du proxy
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // Important pour CORS avec credentials

// Intercepteur pour ajouter le token à chaque requête
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('ecodeli_token');
    
    if (token) {
      // Ajouter le token Bearer à chaque requête
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token injecté dans la requête:', config.url);
    } else {
      console.warn('Pas de token trouvé pour la requête:', config.url);
    }
    
    return config;
  },
  error => {
    console.error('Erreur dans l\'intercepteur Axios:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Gérer les erreurs 401 (non autorisé) - souvent causée par un token expiré
    if (error.response && error.response.status === 401) {
      console.warn('Accès non autorisé (401):', error.response.config.url);
      
      // Option: rediriger vers la page de login si on détecte une session expirée
      // ou non autorisée
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axios;
