import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useListingStore from '../store/listingStore';
import { toast } from 'react-toastify';

const useListings = () => {
  const navigate = useNavigate();
  const { 
    listings, 
    currentListing, 
    userListings, 
    isLoading,
    error, 
    fetchAllListings, 
    fetchListingById,
    fetchUserListings,
    createListing,
    updateListing,
    deleteListing,
    resetCurrentListing,
    clearError
  } = useListingStore();

  // Fonction pour récupérer toutes les annonces avec gestion des erreurs
  const getAllListings = useCallback(async (params = {}) => {
    try {
      await fetchAllListings(params);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les annonces');
      return false;
    }
  }, [fetchAllListings]);

  // Fonction pour récupérer une annonce spécifique
  const getListingById = useCallback(async (id) => {
    try {
      await fetchListingById(id);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger cette annonce');
      return false;
    }
  }, [fetchListingById]);

  // Fonction pour récupérer les annonces de l'utilisateur
  const getUserListings = useCallback(async () => {
    try {
      await fetchUserListings();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger vos annonces');
      return false;
    }
  }, [fetchUserListings]);

  // Fonction pour créer une nouvelle annonce
  const handleCreateListing = useCallback(async (listingData) => {
    try {
      const result = await createListing(listingData);
      toast.success('Annonce créée avec succès!');
      navigate(`/annonces/${result.id}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de créer l\'annonce');
      return false;
    }
  }, [createListing, navigate]);

  // Fonction pour mettre à jour une annonce
  const handleUpdateListing = useCallback(async (id, listingData) => {
    try {
      await updateListing(id, listingData);
      toast.success('Annonce mise à jour avec succès!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de mettre à jour l\'annonce');
      return false;
    }
  }, [updateListing]);

  // Fonction pour supprimer une annonce
  const handleDeleteListing = useCallback(async (id) => {
    try {
      await deleteListing(id);
      toast.success('Annonce supprimée avec succès!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de supprimer l\'annonce');
      return false;
    }
  }, [deleteListing, navigate]);

  return {
    listings,
    currentListing,
    userListings,
    isLoading,
    error,
    getAllListings,
    getListingById,
    getUserListings,
    handleCreateListing,
    handleUpdateListing,
    handleDeleteListing,
    resetCurrentListing,
    clearError
  };
};

export default useListings;
