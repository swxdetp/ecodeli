import api from './axios';

export const AuthService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Accéder au token et à l'utilisateur dans la structure de données API correcte
    if (response.data && response.data.data && response.data.data.token) {
      localStorage.setItem('ecodeli_token', response.data.data.token);
      localStorage.setItem('ecodeli_user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },
  
  register: async (userData) => {
    // Vérifier si userData est une instance de FormData
    const isFormData = userData instanceof FormData;
    
    const config = {};
    
    // Si c'est FormData, configurer les en-têtes nécessaires
    if (isFormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    
    // Envoyer la requête avec les configurations appropriées
    const response = await api.post('/auth/register', userData, config);
    return response.data;
  },
  
  updatePassword: async (passwordData) => {
    const response = await api.post('/update-password', passwordData);
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
  },
  
  // Récupérer les documents d'identité de l'utilisateur connecté
  getUserDocuments: async () => {
    const response = await api.get('/user/identity-documents');
    return response.data;
  },
  
  // Télécharger un document d'identité spécifique
  downloadDocument: async (documentId) => {
    try {
      // Appel API avec responseType 'blob' pour télécharger le fichier
      const response = await api.get(`/user/identity-documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un lien temporaire et simuler un clic pour le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-identite-${documentId}.pdf`); // Nom générique
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  }
};

export default AuthService;
