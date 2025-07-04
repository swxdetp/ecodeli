import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import LivreurService from '../../api/livreur.service';
import { FaCheck, FaTimes, FaMapMarkedAlt, FaFilter, FaCalendar, FaCity, FaCopy } from 'react-icons/fa';

const Annonces = () => {
  const location = useLocation();
  const [annonces, setAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    city: '',
    date: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Rafraîchir les données quand on change de page ou modifie les filtres
  useEffect(() => {
    fetchAnnonces();
  }, [pagination.current_page, filters, lastRefresh]);
  
  // Détecter quand l'utilisateur arrive sur cette page et rafraîchir les données
  useEffect(() => {
    // Forcer le rafraîchissement quand l'utilisateur navigue vers cette page
    // Particulièrement utile après une annulation de livraison
    setLastRefresh(Date.now());
    
    // Afficher un message informatif si l'utilisateur vient d'annuler une livraison
    const fromCanceledDelivery = location.state?.fromCanceledDelivery;
    if (fromCanceledDelivery) {
      toast.info("Les annonces ont été actualisées suite à votre annulation");
    }
  }, [location.pathname]);

  const fetchAnnonces = async () => {
    try {
      setIsLoading(true);
      const response = await LivreurService.getAnnoncesDisponibles({
        page: pagination.current_page,
        ...filters
      });
      
      console.log('Réponse API annonces:', response.data); // Debug
      
      if (response.data && response.data.success) {
        // Vérifier la structure de la réponse et adapter en conséquence
        const annoncesList = Array.isArray(response.data.data) ? response.data.data : [];
        setAnnonces(annoncesList);
        
        // Extraire les infos de pagination directement de la réponse
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 10,
          total: response.data.total || 0
        });
      } else {
        toast.error("Erreur lors de la récupération des annonces");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      toast.error("Impossible de charger les annonces");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccepter = async (id) => {
    try {
      console.log('Tentative d\'acceptation de l\'annonce ID:', id);
      const response = await LivreurService.accepterAnnonce(id);
      console.log('Réponse acceptation:', response);
      
      if (response.data && response.data.success) {
        toast.success("Annonce acceptée avec succès");
        fetchAnnonces(); // Rafraîchir la liste
      } else {
        console.error('Échec (réponse non réussie):', response.data);
        toast.error(response.data?.message || "Erreur lors de l'acceptation de l'annonce");
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'annonce:", error);
      console.error("Détails:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || "Impossible d'accepter l'annonce");
    }
  };

  const handleRefuser = async (id) => {
    try {
      const response = await LivreurService.refuserAnnonce(id);
      if (response.data && response.data.success) {
        toast.success("Annonce refusée");
        fetchAnnonces(); // Rafraîchir la liste
      } else {
        toast.error(response.data.message || "Erreur lors du refus de l'annonce");
      }
    } catch (error) {
      console.error("Erreur lors du refus de l'annonce:", error);
      toast.error("Impossible de refuser l'annonce");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      date: '',
      type: ''
    });
  };

  // Fonction pour ouvrir la page de redirection vers Google Maps
  const openGoogleMaps = (annonce) => {
    if (!annonce || !annonce.address_to) {
      toast.error("Adresse de destination manquante");
      return;
    }
    
    try {
      // Utiliser notre page HTML de redirection intermédiaire
      const origin = encodeURIComponent("242 Rue du Faubourg Saint-Antoine, 75012 Paris");
      const destination = encodeURIComponent(annonce.address_to);
      
      // Construire l'URL vers notre page de redirection avec les paramètres
      const redirectUrl = `/redirect-maps.html?origin=${origin}&destination=${destination}`;
      
      // Ouvrir la page de redirection dans un nouvel onglet
      window.open(redirectUrl, "_blank");
      
      // Ouvrir dans la même fenêtre si window.open ne fonctionne pas
      setTimeout(() => {
        if (!window.open) {
          window.location.href = redirectUrl;
        }
      }, 100);
      
      toast.success("Redirection vers la carte...");
    } catch (error) {
      console.error("Erreur lors de la redirection:", error);
      toast.error("Impossible d'ouvrir la carte. Veuillez réessayer.");
    }
  };
  
  // Fonction pour fermer la carte
  const closeMap = () => {
    setShowMap(false);
    setSelectedAnnonce(null);
  };

  const renderPagination = () => {
    const pages = [];
    
    // Bouton précédent
    pages.push(
      <button 
        key="prev" 
        onClick={() => setPagination(prev => ({ ...prev, current_page: Math.max(1, prev.current_page - 1) }))}
        disabled={pagination.current_page === 1}
        className="px-3 py-1 rounded border mr-1 disabled:opacity-50"
      >
        Précédent
      </button>
    );
    
    // Pages
    for (let i = 1; i <= pagination.last_page; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setPagination(prev => ({ ...prev, current_page: i }))}
          className={`px-3 py-1 rounded border mr-1 ${pagination.current_page === i ? 'bg-green-500 text-white' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Bouton suivant
    pages.push(
      <button 
        key="next" 
        onClick={() => setPagination(prev => ({ ...prev, current_page: Math.min(prev.last_page, prev.current_page + 1) }))}
        disabled={pagination.current_page === pagination.last_page}
        className="px-3 py-1 rounded border mr-1 disabled:opacity-50"
      >
        Suivant
      </button>
    );
    
    return (
      <div className="flex justify-center mt-4">
        {pages}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Annonces disponibles</h1>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition"
        >
          <FaFilter className="mr-2" />
          Filtres
        </button>
      </div>
      
      {/* Filtres */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                <FaCity className="mr-2" /> Ville
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Filtrer par ville"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                <FaCalendar className="mr-2" /> Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Tous les types</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="fragile">Fragile</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md mr-2"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : annonces.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Aucune annonce disponible pour le moment</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {annonces.map(annonce => (
              <div key={annonce.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{annonce.title}</h3>
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Destination:</span> {annonce.address_to}
                    </p>
                    <div className="mt-2">
                      <p className="text-gray-600"><span className="font-medium">Date:</span> {new Date(annonce.date_from).toLocaleDateString()}</p>
                      <p className="text-gray-600"><span className="font-medium">Type:</span> {annonce.type}</p>
                      <p className="text-gray-600"><span className="font-medium">Prix:</span> {annonce.price} €</p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-700">{annonce.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("242 Rue du Faubourg Saint-Antoine, 75012 Paris")}&destination=${encodeURIComponent(annonce.address_to)}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                      >
                        <FaMapMarkedAlt className="mr-2" />
                        Google Maps
                      </a>
                      
                      <a
                        href={`https://www.waze.com/ul?ll=48.8566,2.3522&navigate=yes&zoom=17&destination=${encodeURIComponent(annonce.address_to)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition"
                      >
                        <span role="img" aria-label="car" className="mr-2">🚗</span>
                        Waze
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Boutons d'action pour accepter ou refuser l'annonce */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => handleRefuser(annonce.id)}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-md transition"
                  >
                    <FaTimes className="mr-2" />
                    Refuser
                  </button>
                  
                  <button
                    onClick={() => handleAccepter(annonce.id)}
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md transition"
                  >
                    <FaCheck className="mr-2" />
                    Accepter
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.last_page > 1 && renderPagination()}
        </>
      )}
      
      {/* Modal pour l'itinéraire - Version ultra simplifiée sans composant externe */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Itinéraire</h2>
              <button 
                onClick={closeMap}
                className="text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4">
              {selectedAnnonce ? (
                <>
                  <h3 className="text-lg font-medium mb-2">{selectedAnnonce.title || "Livraison"}</h3>
                  
                  {/* Info itinéraire ultra simplifiée */}
                  <div className="bg-gray-50 rounded-lg border p-4 mb-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-500">Départ</p>
                          <p className="text-blue-600">242 Rue du Faubourg Saint-Antoine, 75012 Paris</p>
                        </div>
                      </div>
                      
                      <div className="w-0.5 h-10 bg-gray-300 ml-2"></div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-500">Destination</p>
                          <p className="text-red-600">{selectedAnnonce.address_to}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const adresses = `Départ: 242 Rue du Faubourg Saint-Antoine, 75012 Paris\nDestination: ${selectedAnnonce.address_to}`;
                        navigator.clipboard.writeText(adresses)
                          .then(() => toast.success("Adresses copiées"))
                          .catch(() => toast.error("Erreur lors de la copie"));
                      }}
                      className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                    >
                      <FaCopy className="mr-2" /> Copier les adresses
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Collez les adresses dans Google Maps, Waze ou votre application GPS préférée
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-red-500">Aucune annonce sélectionnée</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Annonces;
