import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaBox, FaEuroSign, FaUser, FaClock } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useListings from '../../hooks/useListings';

const ListingDetail = ({ listing }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleDeleteListing, isLoading } = useListings();
  
  // Format de la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Format de la date de création avec l'heure
  const formatCreatedAt = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Traduction de la taille du colis
  const packageSizeTranslation = {
    small: 'Petit (moins de 2kg)',
    medium: 'Moyen (2-5kg)',
    large: 'Grand (5-10kg)',
    extra_large: 'Très grand (plus de 10kg)'
  };

  // Vérifier si l'utilisateur est le propriétaire de l'annonce
  const isOwner = user && listing && user.id === listing.user_id;

  // Gérer la suppression de l'annonce
  const onDeleteListing = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      await handleDeleteListing(listing.id);
    }
  };

  // Redirection vers la page d'édition
  const onEditListing = () => {
    navigate(`/annonces/edit/${listing.id}`);
  };

  if (!listing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          {listing.title}
        </h1>
        
        <div className="flex items-center text-gray-600 mb-6">
          <FaClock className="mr-2 text-green-500" />
          <span>Publié le {formatCreatedAt(listing.created_at)}</span>
          
          {listing.created_at !== listing.updated_at && (
            <span className="ml-2 text-sm">(Modifié le {formatCreatedAt(listing.updated_at)})</span>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Détails de la livraison</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-3 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Adresse d'enlèvement</p>
                  <p className="text-gray-600">{listing.pickup_address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-3 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Adresse de livraison</p>
                  <p className="text-gray-600">{listing.delivery_address}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className="mr-3 text-green-500" />
                <div>
                  <p className="font-medium">Date de livraison souhaitée</p>
                  <p className="text-gray-600">{formatDate(listing.delivery_date)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Caractéristiques du colis</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaBox className="mr-3 text-green-500" />
                <div>
                  <p className="font-medium">Taille du colis</p>
                  <p className="text-gray-600">{packageSizeTranslation[listing.package_size] || listing.package_size}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaEuroSign className="mr-3 text-green-500" />
                <div>
                  <p className="font-medium">Prix proposé</p>
                  <p className="text-green-600 font-bold">{parseFloat(listing.price).toFixed(2)} €</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaUser className="mr-3 text-green-500" />
                <div>
                  <p className="font-medium">Client</p>
                  <p className="text-gray-600">{listing.user?.name || 'Utilisateur anonyme'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex justify-end space-x-4 border-t pt-6">
            <button
              onClick={onEditListing}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              Modifier l'annonce
            </button>
            <button
              onClick={onDeleteListing}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer l\'annonce'}
            </button>
          </div>
        )}
        
        {!isOwner && user && (
          <div className="text-center border-t pt-6">
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 font-bold"
            >
              Proposer mes services de livraison
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Cette fonctionnalité sera disponible prochainement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
