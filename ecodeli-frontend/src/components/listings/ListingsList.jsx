import React, { useEffect } from 'react';
import ListingCard from './ListingCard';
import useListings from '../../hooks/useListings';

const ListingsList = ({ userOnly = false }) => {
  const { 
    listings, 
    userListings, 
    isLoading, 
    error, 
    getAllListings, 
    getUserListings 
  } = useListings();

  useEffect(() => {
    const fetchListings = async () => {
      if (userOnly) {
        await getUserListings();
      } else {
        await getAllListings();
      }
    };

    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOnly]);

  // Sélectionner les annonces appropriées en fonction de userOnly
  const displayListings = userOnly ? userListings : listings;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        <p>Une erreur est survenue lors du chargement des annonces.</p>
        <p>{error}</p>
      </div>
    );
  }

  if (displayListings.length === 0) {
    return (
      <div className="bg-gray-100 text-gray-700 p-8 rounded-md text-center">
        <h3 className="text-xl font-semibold mb-2">
          {userOnly 
            ? "Vous n'avez pas encore créé d'annonces" 
            : "Aucune annonce disponible pour le moment"
          }
        </h3>
        <p className="mb-4">
          {userOnly 
            ? "Créez votre première annonce pour trouver un livreur écologique" 
            : "Revenez plus tard pour découvrir les nouvelles annonces"
          }
        </p>
        {userOnly && (
          <a 
            href="/annonces/create" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Créer une annonce
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayListings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingsList;
