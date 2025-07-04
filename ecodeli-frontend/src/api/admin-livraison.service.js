import axios from 'axios';

/**
 * Service pour la gestion des livraisons côté admin
 */
const adminLivraisonService = {
  // Récupérer toutes les livraisons
  getAllLivraisons: () => {
    return axios.get('/admin/livraisons');
  },

  // Récupérer les livraisons en attente de validation (status = delivered)
  getPendingLivraisons: () => {
    return axios.get('/admin/livraisons/pending');
  },

  // Valider une livraison
  validateLivraison: (id) => {
    return axios.put(`/admin/livraisons/${id}/validate`);
  },

  // Refuser une livraison
  refuseLivraison: (id, reason) => {
    return axios.put(`/admin/livraisons/${id}/refuse`, { reason });
  },

  // Récupérer une livraison par ID
  getLivraisonById: (id) => {
    return axios.get(`/admin/livraisons/${id}`);
  },
};

export default adminLivraisonService;
