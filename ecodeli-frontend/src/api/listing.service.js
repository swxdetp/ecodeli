import api from './axios';

export const ListingService = {
  // Récupérer toutes les annonces
  getAllListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },
  
  // Récupérer une annonce spécifique par ID
  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },
  
  // Récupérer les annonces de l'utilisateur connecté
  getUserListings: async () => {
    const response = await api.get('/user/listings');
    return response.data;
  },
  
  // Créer une nouvelle annonce
  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData);
    return response.data;
  },
  
  // Mettre à jour une annonce existante
  updateListing: async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  },
  
  // Supprimer une annonce
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  }
};

export default ListingService;
