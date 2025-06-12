import React, { useEffect, useState } from 'react';
import ListingsList from '../components/listings/ListingsList';
import useListings from '../hooks/useListings';

const Listings = () => {
  const { getAllListings } = useListings();
  const [filters, setFilters] = useState({
    packageSize: '',
    sortBy: 'latest'
  });
  
  useEffect(() => {
    const fetchListings = async () => {
      // Convertir les filtres en paramètres API
      const params = {};
      if (filters.packageSize) params.package_size = filters.packageSize;
      if (filters.sortBy) params.sort_by = filters.sortBy;
      
      await getAllListings(params);
    };
    
    fetchListings();
  }, [getAllListings, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Toutes les annonces de livraison
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="packageSize" className="block text-gray-700 mb-2">
                Taille du colis
              </label>
              <select
                id="packageSize"
                name="packageSize"
                value={filters.packageSize}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
              >
                <option value="">Toutes les tailles</option>
                <option value="small">Petit (moins de 2kg)</option>
                <option value="medium">Moyen (2-5kg)</option>
                <option value="large">Grand (5-10kg)</option>
                <option value="extra_large">Très grand (plus de 10kg)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-gray-700 mb-2">
                Trier par
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
              >
                <option value="latest">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="delivery_date">Date de livraison</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <ListingsList userOnly={false} />
        </div>
      </div>
    </div>
  );
};

export default Listings;
