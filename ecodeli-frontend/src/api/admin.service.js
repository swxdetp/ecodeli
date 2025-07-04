import api from './axios';

export const AdminService = {
  // Gestion des utilisateurs
  getAllUsers: async (params = {}) => {
    // Stratégie progressive avec 3 routes différentes pour assurer la robustesse
    try {
      // 1. D'abord, essayer la nouvelle route ultra-simplifiée avec SQL direct
      console.log('Tentative avec route simplifiée (SQL direct)...');
      const getUsers = () => {
        return api.get('/admin/dashboard/users-list', { params });
      }
      const responseList = await getUsers();
      if (responseList.data && responseList.data.data) {
        console.log('Réponse de la route SQL direct:', responseList);
        return responseList.data;
      }
    } catch (error) {
      console.error('Erreur avec route SQL direct:', error);
    }
    
    try {
      // 2. Ensuite, essayer la route publique
      console.log('Tentative avec route publique...');
      const responsePublic = await api.get('/admin/users-public', { params });
      if (responsePublic.data && responsePublic.data.data) {
        console.log('Réponse de la route publique:', responsePublic);
        return responsePublic.data;
      }
    } catch (error) {
      console.error('Erreur avec route publique:', error);
    }
    
    try {
      // 3. En dernier recours, utiliser la route standard
      console.log('Tentative avec route standard...');
      const responseStandard = await api.get('/admin/users', { params });
      if (responseStandard.data && responseStandard.data.data) {
        return responseStandard.data;
      }
      return responseStandard;
    } catch (finalError) {
      console.error('Toutes les tentatives ont échoué:', finalError);
      // Fournir une réponse de secours pour éviter de planter l'interface
      return {
        success: false,
        message: 'Impossible de récupérer les utilisateurs après plusieurs tentatives',
        data: []
      };
    }
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  // Gestion des annonces
  getAllAnnonces: async (params = {}) => {
    // Stratégie progressive avec 3 routes différentes pour assurer la robustesse
    try {
      // 1. D'abord, essayer la nouvelle route ultra-simplifiée avec SQL direct
      console.log('Tentative avec route simplifiée annonces (SQL direct)...');
      const responseList = await api.get('/admin/annonces-list', { params });
      if (responseList.data && responseList.data.data) {
        console.log('Réponse de la route SQL direct annonces:', responseList);
        return responseList.data;
      }
    } catch (error) {
      console.error('Erreur avec route SQL direct annonces:', error);
    }
    
    try {
      // 2. Ensuite, essayer la route publique (si elle existe)
      console.log('Tentative avec route publique annonces...');
      const responsePublic = await api.get('/admin/annonces-public', { params });
      if (responsePublic.data && responsePublic.data.data) {
        console.log('Réponse de la route publique annonces:', responsePublic);
        return responsePublic.data;
      }
    } catch (error) {
      console.error('Erreur avec route publique annonces:', error);
    }
    
    try {
      // 3. En dernier recours, utiliser la route standard
      console.log('Tentative avec route standard annonces...');
      const responseStandard = await api.get('/admin/annonces', { params });
      if (responseStandard.data && responseStandard.data.data) {
        return responseStandard.data;
      }
      return responseStandard;
    } catch (finalError) {
      console.error('Toutes les tentatives ont échoué pour annonces:', finalError);
      // Fournir une réponse de secours pour éviter de planter l'interface
      return {
        success: false,
        message: 'Impossible de récupérer les annonces après plusieurs tentatives',
        data: []
      };
    }
  },
  
  getAnnonceById: async (id) => {
    const response = await api.get(`/admin/annonces/${id}`);
    return response.data;
  },
  
  updateAnnonce: async (id, annonceData) => {
    const response = await api.put(`/admin/annonces/${id}`, annonceData);
    return response.data;
  },
  
  deleteAnnonce: async (id) => {
    const response = await api.delete(`/admin/annonces/${id}`);
    return response.data;
  },
  
  // Gestion des livraisons
  getAllLivraisons: async (params = {}) => {
    // Stratégie progressive avec 3 routes différentes pour assurer la robustesse
    try {
      // 1. D'abord, essayer la route publique qui est fonctionnelle
      console.log('Tentative avec route publique livraisons (prioritaire)...');
      const responsePublic = await api.get('/public/livraisons', { params });
      console.log('Réponse complète de la route publique:', responsePublic);
      if (responsePublic.data && responsePublic.data.data) {
        console.log('Données livraisons récupérées:', responsePublic.data.data);
        return responsePublic.data;
      }
    } catch (error) {
      console.error('Erreur avec route publique livraisons:', error);
    }
    
    try {
      // 2. Ensuite, essayer la route simplifiée
      console.log('Tentative avec route simplifiée livraisons...');
      const responseList = await api.get('/admin/livraisons-list', { params });
      if (responseList.data && responseList.data.data) {
        console.log('Réponse de la route simplifiée livraisons:', responseList);
        return responseList.data;
      }
    } catch (error) {
      console.error('Erreur avec route simplifiée livraisons:', error);
    }
    
    try {
      // 3. En dernier recours, essayer la route standard
      console.log('Tentative avec route standard livraisons...');
      const responseStandard = await api.get('/admin/livraisons', { params });
      if (responseStandard.data && responseStandard.data.data) {
        console.log('Réponse de la route standard livraisons:', responseStandard);
        return responseStandard.data;
      }
      return responseStandard;
    } catch (finalError) {
      console.error('Toutes les tentatives ont échoué pour livraisons:', finalError);
    }
    
    // Fournir une réponse de secours pour éviter de planter l'interface
    console.warn("Aucune donnée de livraison n'a pu être récupérée, utilisation des données de secours");
    return {
      success: false,
      message: 'Impossible de récupérer les livraisons après plusieurs tentatives',
      data: []
    };
  },
  
  getLivraisonById: async (id) => {
    const response = await api.get(`/admin/livraisons/${id}`);
    return response.data;
  },
  
  updateLivraison: async (id, livraisonData) => {
    const response = await api.put(`/admin/livraisons/${id}`, livraisonData);
    return response.data;
  },
  
  deleteLivraison: async (id) => {
    const response = await api.delete(`/admin/livraisons/${id}`);
    return response.data;
  },

  // Gestion des invitations
  getPendingInvitations: async (params = {}) => {
    try {
      // Essayer d'abord la route simplifiée
      console.log('Récupération des invitations en attente...');
      const response = await api.get('/admin/invitations', { params });
      if (response.data && response.data.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      // Fournir une réponse de secours pour éviter de planter l'interface
      return {
        success: false,
        message: 'Impossible de récupérer les invitations',
        data: []
      };
    }
  },

  getInvitationById: async (id) => {
    const response = await api.get(`/admin/invitations/${id}`);
    return response.data;
  },

  acceptInvitation: async (id) => {
    const response = await api.post(`/admin/invitations/${id}/accept`);
    return response.data;
  },

  rejectInvitation: async (id, data = {}) => {
    const response = await api.post(`/admin/invitations/${id}/reject`, data);
    return response.data;
  }
};

export default AdminService;
