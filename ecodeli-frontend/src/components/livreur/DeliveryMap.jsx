import React from 'react';

// Version simplifiée de DeliveryMap sans dépendance à Google Maps API
// Cette version affiche simplement un message avec des liens vers Google Maps et Waze
const DeliveryMap = ({ destination, height = '300px' }) => {
  // Générer les URLs vers Google Maps et Waze
  const origin = "242 Rue du Faubourg Saint-Antoine, 75012 Paris";
  
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  
  const wazeUrl = `https://www.waze.com/ul?ll=48.8566,2.3522&navigate=yes&zoom=17&destination=${encodeURIComponent(destination)}`;

  return (
    <div className="rounded-lg overflow-hidden shadow border border-gray-200 p-4" style={{ height }}>
      <div className="flex flex-col h-full justify-center items-center space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Itinéraire de livraison</h3>
          <p className="text-sm text-gray-600 mb-4">Utilisez un service de cartographie pour voir l'itinéraire</p>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Départ</p>
                <p className="text-sm">{origin}</p>
              </div>
            </div>
            
            <div className="h-6 border-l border-dashed border-gray-300 ml-2"></div>
            
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
              <div className="text-left">
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm">{destination}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 w-full max-w-xs">
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          >
            <span className="mr-2">🗺️</span> 
            Voir dans Google Maps
          </a>
          
          <a 
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
          >
            <span className="mr-2">🚗</span> 
            Voir dans Waze
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
