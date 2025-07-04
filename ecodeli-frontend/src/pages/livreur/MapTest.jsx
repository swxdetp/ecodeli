import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MapTest = () => {
  const [address, setAddress] = useState("10 rue de Rivoli, 75001 Paris");
  const [mapUrl, setMapUrl] = useState("");
  const [method, setMethod] = useState(1);

  // Différentes méthodes de génération d'URL Maps
  const generateMapUrl = () => {
    const startAddress = "242 Rue du Faubourg Saint-Antoine, 75012 Paris";
    
    let url = "";
    
    switch(method) {
      case 1:
        // Méthode 1: Format d'API avec params
        url = `https://www.google.com/maps/dir/?api=1&origin=${startAddress.replace(/\s+/g, '+')}&destination=${address.replace(/\s+/g, '+')}&travelmode=driving`;
        break;
      case 2:
        // Méthode 2: Format href embed
        url = `https://maps.google.com/maps?saddr=${encodeURIComponent(startAddress)}&daddr=${encodeURIComponent(address)}&output=embed`;
        break;
      case 3:
        // Méthode 3: Format direct
        url = `https://www.google.com/maps/dir/${startAddress.replace(/\s+/g, '+')}/${address.replace(/\s+/g, '+')}`;
        break;
      case 4:
        // Méthode 4: Sans paramètres
        url = `https://www.google.fr/maps`;
        break;
      default:
        url = `https://www.google.com/maps/dir/?api=1&origin=${startAddress.replace(/\s+/g, '+')}&destination=${address.replace(/\s+/g, '+')}&travelmode=driving`;
    }
    
    setMapUrl(url);
    console.log("URL générée:", url);
    return url;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to="/livreur/annonces" className="text-blue-500 hover:underline">
          &larr; Retour aux annonces
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Test des liens Google Maps</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Adresse de destination:</label>
          <input 
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Méthode de génération d'URL:</label>
          <select 
            value={method}
            onChange={(e) => setMethod(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={1}>Méthode 1: Format API avec params</option>
            <option value={2}>Méthode 2: Format href embed</option>
            <option value={3}>Méthode 3: Format direct</option>
            <option value={4}>Méthode 4: Maps sans paramètres</option>
          </select>
        </div>
        
        <button 
          onClick={generateMapUrl}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Générer l'URL
        </button>
      </div>
      
      {mapUrl && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">URL générée:</h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-4 break-all">
            <code>{mapUrl}</code>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Ouvrir dans un nouvel onglet
            </a>
            
            <a 
              href={mapUrl}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            >
              Ouvrir dans l'onglet actuel
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Exemples de liens maps (cliquez pour tester):</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a 
              href="https://www.google.com/maps" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google Maps simple
            </a>
          </li>
          <li>
            <a 
              href="https://www.google.com/maps/@48.856614,2.3522219,15z" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google Maps centré sur Paris
            </a>
          </li>
          <li>
            <a 
              href="https://www.google.com/maps/dir/242+Rue+du+Faubourg+Saint-Antoine,+75012+Paris/10+rue+de+Rivoli,+75001+Paris" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Itinéraire direct (format 3)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MapTest;
