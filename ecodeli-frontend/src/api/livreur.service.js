import axios from 'axios';

/**
 * Service pour les appels API de l'espace livreur
 */
const LivreurService = {
  // Tableau de bord
  getDashboard: () => {
    return axios.get('/livreur/dashboard');
  },
  
  // Annonces disponibles
  getAnnoncesDisponibles: (filters = {}) => {
    return axios.get('/livreur/annonces', { params: filters });
  },
  
  // Accepter une annonce
  accepterAnnonce: (annonceId) => {
    return axios.post(`/livreur/annonces/${annonceId}/accepter`);
  },
  
  // Refuser une annonce
  refuserAnnonce: (annonceId) => {
    return axios.post(`/livreur/annonces/${annonceId}/refuser`);
  },
  
  // Récupérer les livraisons du livreur
  getLivraisons: (status = null) => {
    const params = status ? { status } : {};
    return axios.get('/livreur/livraisons', { params });
  },
  
  // Détails d'une livraison
  getLivraison: (id) => {
    return axios.get(`/livreur/livraisons/${id}`);
  },
  
  // Mettre à jour le statut d'une livraison
  updateLivraisonStatus: (id, status) => {
    return axios.put(`/livreur/livraisons/${id}/status`, { status });
  },
  
  // Annuler une livraison (suppression logique)
  cancelLivraison: (id) => {
    return axios.delete(`/livreur/livraisons/${id}`);
  },
  
  // Profil du livreur
  getProfil: () => {
    return axios.get('/livreur/profil');
  },
  
  // Mettre à jour le profil
  updateProfil: (data) => {
    return axios.put('/livreur/profil', data);
  },
  
  // Upload de documents
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('id_document', file);
    
    return axios.post('/livreur/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Télécharger un document d'identité
  downloadDocument: (documentId) => {
    return axios.get(`/user/identity-documents/${documentId}/download`, {
      responseType: 'blob'
    })
    .then(response => {
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un lien temporaire et simuler un clic pour le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-identite-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    });
  },
  
  // Récupérer les documents d'identité
  getDocuments: () => {
    return axios.get('/user/identity-documents');
  }
};

export default LivreurService;
