import React from 'react';

/**
 * Composant d'affichage simple d'une carte statique 
 * Version simplifiée sans appel API externe pour éviter les erreurs de rendu
 */
const SimpleMap = ({ origin, destination, className }) => {
  // Valeurs par défaut
  const start = origin || "242 Rue du Faubourg Saint-Antoine, 75012 Paris";
  const end = destination || "Tour Eiffel, Paris";
  
  // Instructions d'itinéraire simplifiées
  const directions = [
    `Départ: ${start}`,
    `Arrivée: ${end}`,
    "Utilisez un service de navigation GPS pour l'itinéraire complet"
  ];

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`}>
      <h3 className="text-lg font-semibold mb-2">Itinéraire</h3>
      
      {/* Zone de carte simplifiée - sans API externe */}
      <div className="mb-4 bg-gray-100 rounded-lg border p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-6 h-6 rounded-full bg-blue-500"></div>
          <div className="h-16 border-l-2 border-dashed border-gray-400"></div>
          <div className="w-6 h-6 rounded-full bg-red-500"></div>
        </div>
      </div>
      
      {/* Instructions simplifiées */}
      <div className="space-y-2">
        {directions.map((direction, index) => (
          <p key={index} className={`${index === 0 ? 'text-blue-600' : index === 1 ? 'text-red-600' : 'text-gray-600'}`}>
            {direction}
          </p>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 mt-4">
        Pour un itinéraire détaillé, copiez les adresses dans Google Maps ou Waze.
      </p>
      
      {/* Bouton pour copier les adresses */}
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition w-full"
        onClick={() => {
          try {
            const text = `Départ: ${start}\nDestination: ${end}`;
            navigator.clipboard.writeText(text);
            alert("Adresses copiées dans le presse-papier!");
          } catch (e) {
            console.error("Erreur lors de la copie:", e);
            alert("Impossible de copier les adresses");
          }
        }}
      >
        Copier les adresses
      </button>
    </div>
  );
};

export default SimpleMap;
