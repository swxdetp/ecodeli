import { create } from 'zustand';
import ListingService from '../api/listing.service';

const useListingStore = create((set, get) => ({
  listings: [],
  currentListing: null,
  userListings: [],
  isLoading: false,
  error: null,
  
  // Récupérer toutes les annonces
  fetchAllListings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ListingService.getAllListings(params);
      set({ listings: data.data || data, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de récupérer les annonces';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Récupérer une annonce spécifique par ID
  fetchListingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ListingService.getListingById(id);
      set({ currentListing: data, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de récupérer cette annonce';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Récupérer les annonces de l'utilisateur connecté
  fetchUserListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ListingService.getUserListings();
      set({ userListings: data.data || data, isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de récupérer vos annonces';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Créer une nouvelle annonce
  createListing: async (listingData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ListingService.createListing(listingData);
      set((state) => ({
        userListings: [...state.userListings, data],
        isLoading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de créer l\'annonce';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Mettre à jour une annonce
  updateListing: async (id, listingData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ListingService.updateListing(id, listingData);
      set((state) => ({
        userListings: state.userListings.map(listing => 
          listing.id === id ? data : listing
        ),
        listings: state.listings.map(listing => 
          listing.id === id ? data : listing
        ),
        currentListing: state.currentListing?.id === id ? data : state.currentListing,
        isLoading: false
      }));
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de mettre à jour l\'annonce';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Supprimer une annonce
  deleteListing: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ListingService.deleteListing(id);
      set((state) => ({
        userListings: state.userListings.filter(listing => listing.id !== id),
        listings: state.listings.filter(listing => listing.id !== id),
        currentListing: state.currentListing?.id === id ? null : state.currentListing,
        isLoading: false
      }));
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Impossible de supprimer l\'annonce';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Réinitialiser l'annonce actuelle
  resetCurrentListing: () => set({ currentListing: null }),
  
  // Effacer les erreurs
  clearError: () => set({ error: null }),
}));

export default useListingStore;
