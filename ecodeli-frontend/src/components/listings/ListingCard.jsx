import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaBox, FaEuroSign } from 'react-icons/fa';

const ListingCard = ({ listing }) => {
  // Format de la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Traduction de la taille du colis
  const packageSizeTranslation = {
    small: 'Petit (< 2kg)',
    medium: 'Moyen (2-5kg)',
    large: 'Grand (5-10kg)',
    extra_large: 'Très grand (> 10kg)'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-green-600 mb-2 truncate">
          {listing.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2 h-12">
          {listing.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-green-500" />
            <span className="truncate">De: {listing.pickup_address}</span>
          </div>
          
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2 text-green-500" />
            <span className="truncate">Vers: {listing.delivery_address}</span>
          </div>
          
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-green-500" />
            <span>Livraison: {formatDate(listing.delivery_date)}</span>
          </div>
          
          <div className="flex items-center">
            <FaBox className="mr-2 text-green-500" />
            <span>{packageSizeTranslation[listing.package_size] || listing.package_size}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-lg font-bold text-green-600">
            <FaEuroSign className="mr-1" />
            {parseFloat(listing.price).toFixed(2)}
          </div>
          
          <Link 
            to={`/annonces/${listing.id}`} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
