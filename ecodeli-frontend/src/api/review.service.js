import axios from 'axios';

/**
 * Service pour la gestion des avis clients (système NFC)
 */
const ReviewService = {
  /**
   * Soumettre un avis après un scan NFC
   * @param {Object} reviewData - Les données de l'avis
   * @returns {Promise} Promesse contenant la réponse de l'API
   */
  submitReview: (reviewData) => {
    return axios.post('/reviews', reviewData);
  },

  /**
   * Récupérer les avis d'un livreur
   * @param {number} livreurId - ID du livreur
   * @returns {Promise} Promesse contenant la liste des avis
   */
  getLivreurReviews: (livreurId) => {
    return axios.get(`/livreur/${livreurId}/reviews`);
  },

  /**
   * Récupérer les statistiques d'avis d'un livreur
   * @param {number} livreurId - ID du livreur
   * @returns {Promise} Promesse contenant les statistiques d'avis
   */
  getLivreurReviewStats: (livreurId) => {
    return axios.get(`/livreur/${livreurId}/review-stats`);
  }
};

export default ReviewService;
