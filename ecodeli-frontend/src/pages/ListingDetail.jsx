import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListingDetailComponent from '../components/listings/ListingDetail';
import useListings from '../hooks/useListings';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListingById, currentListing, isLoading, error } = useListings();

  useEffect(() => {
    const fetchListing = async () => {
      const success = await getListingById(id);
      if (!success) {
        // Si l'annonce n'est pas trouvée, redirige vers la liste des annonces
        navigate('/annonces');
      }
    };

    fetchListing();
  }, [id, getListingById, navigate]);

  if (isLoading) {
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
              onClick={() => navigate('/annonces')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retour aux annonces
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
            onClick={() => navigate('/annonces')}
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            &larr; Retour aux annonces
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ListingDetailComponent listing={currentListing} />
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
