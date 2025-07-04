import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListingFormComponent from '../components/forms/ListingForm';
import useListings from '../hooks/useListings';
import useAuth from '../hooks/useAuth';

const ListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    getListingById, 
    currentListing, 
    isLoading, 
    error,
    resetCurrentListing,
    clearError 
  } = useListings();
  
  const isEditMode = !!id;
  
  useEffect(() => {
    // Rediriger si non authentifié
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchListing = async () => {
      if (isEditMode) {
        const success = await getListingById(id);
        if (!success) {
          navigate('/annonces');
        }
      } else {
        // Reset le listing actuel et effacer les erreurs en mode création
        resetCurrentListing();
        clearError(); // Important : efface les erreurs existantes du store
      }
    };
    
    fetchListing();
    
    return () => {
      // Nettoyer l'annonce actuelle lors de la sortie du composant
      resetCurrentListing();
    };
  }, [id, isEditMode, getListingById, navigate, isAuthenticated, resetCurrentListing, clearError]);
  
  const handleSuccess = () => {
    navigate('/dashboard');
  };
  
  if (isLoading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            &larr; Retour au tableau de bord
          </button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-600 mb-6 text-center">
            {isEditMode ? 'Modifier l\'annonce' : 'Créer une nouvelle annonce'}
          </h1>
          
          <ListingFormComponent 
            listing={isEditMode ? currentListing : null}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
