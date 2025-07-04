import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import useAuthStore from '../../store/authStore';
import LivreurService from '../../api/livreur.service';
import DeliveryMap from '../../components/livreur/DeliveryMap';
import { toast } from 'react-toastify';

const LivraisonCard = ({ livraison, onCancelLivraison, onStartLivraison, onMarkDelivered }) => {
  const [showMap, setShowMap] = useState(false);

  // Fonction pour simplifier l'affichage
  const formatAddress = (address) => {
    if (!address) return 'Adresse non spécifiée';
    return address.length > 50 ? `${address.substring(0, 50)}...` : address;
  };

  const handleCancelClick = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette livraison ?')) {
      onCancelLivraison(livraison.id);
    }
  };
  
  const handleStartClick = () => {
    if (window.confirm('Êtes-vous prêt à démarrer cette livraison maintenant ?')) {
      onStartLivraison(livraison.id);
    }
  };
  
  const handleDeliveredClick = () => {
    if (window.confirm('Confirmez-vous que cette livraison a bien été effectuée ?')) {
      onMarkDelivered(livraison.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{livraison.annonce?.title || 'Livraison sans titre'}</h3>
            <p className="text-gray-600 mt-1">
              {new Date(livraison.start_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              livraison.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              livraison.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              livraison.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              livraison.status === 'delivered' ? 'bg-green-100 text-green-800' :
              livraison.status === 'canceled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {livraison.status === 'pending' ? 'En attente' :
             livraison.status === 'accepted' ? 'Accepté' :
             livraison.status === 'in_progress' ? 'En cours' :
             livraison.status === 'delivered' ? 'Livré' :
             livraison.status === 'canceled' ? 'Annulé' : livraison.status}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">De</p>
              <p className="font-medium">{livraison.annonce?.address_from || 'Adresse inconnue'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">À</p>
              <p className="font-medium">{livraison.annonce?.address_to || 'Adresse inconnue'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1">{livraison.annonce?.description || 'Aucune description'}</p>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">Prix</p>
          <p className="font-semibold text-lg text-green-600">{livraison.annonce?.price || '0'} €</p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? 'Masquer la carte' : 'Voir l\'itinéraire'}
            </button>
            
            {/* Bouton pour démarrer une livraison (uniquement pour les livraisons acceptées) */}
            {livraison.status === 'accepted' && (
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
                onClick={handleStartClick}
              >
                Démarrer la livraison
              </button>
            )}
            
            {/* Bouton pour marquer une livraison comme livrée (uniquement pour les livraisons en cours) */}
            {livraison.status === 'in_progress' && (
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-2"
                onClick={handleDeliveredClick}
              >
                Marquer comme livré
              </button>
            )}
            
            {/* Bouton d'annulation (pour les livraisons en attente, acceptées ou en cours) */}
            {(livraison.status === 'pending' || livraison.status === 'accepted' || livraison.status === 'in_progress') && (
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={handleCancelClick}
              >
                Annuler la livraison
              </button>
            )}
          </div>

          {livraison.status === 'delivered' && (
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded">
              Livré le {new Date(livraison.delivery_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {showMap && livraison.annonce?.address_to && (
        <div className="border-t pt-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Adresses de l'itinéraire:</h3>
              <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Départ:</span> 242 Rue du Faubourg Saint-Antoine, 75012 Paris</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Destination:</span> {livraison.annonce.address_to}</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("242 Rue du Faubourg Saint-Antoine, 75012 Paris")}&destination=${encodeURIComponent(livraison.annonce.address_to)}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                onClick={() => toast.success("Ouverture de Google Maps...")}
              >
                <span className="mr-2">🗺️</span>
                Voir sur Google Maps
              </a>
              
              <a 
                href={`https://www.waze.com/ul?ll=48.8566,2.3522&navigate=yes&zoom=17&destination=${encodeURIComponent(livraison.annonce.address_to)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
              >
                <span className="mr-2">🚗</span>
                Voir sur Waze
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Livraisons = () => {
  const { user } = useAuthStore();
  const [livraisons, setLivraisons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLivraisons = async () => {
    try {
      setIsLoading(true);
      
      // Utiliser notre service API pour récupérer les livraisons
      const response = await LivreurService.getLivraisons();
      
      if (response.data && response.data.success) {
        setLivraisons(response.data.data || []);
      } else {
        // Si l'API n'est pas encore prête, utiliser des données fictives
        const fakeLivraisons = [
          {
            id: 1,
            annonce: {
              title: "Livraison de colis à Paris",
              address_from: "ESGI, 242 Rue du Faubourg Saint-Antoine, 75012 Paris",
              address_to: "38 Rue du Louvre, 75001 Paris",
              description: "Petit colis à livrer rapidement",
              price: 18.50
            },
            status: "accepted",
            start_date: "2025-06-28T14:00:00",
          },
          // ...autres livraisons factices
        ];
        
        setLivraisons(fakeLivraisons);
        toast.warning("Utilisation de données de démonstration");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des livraisons:", error);
      toast.error("Impossible de charger vos livraisons");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivraisons();
  }, []);
  // Gérer le démarrage d'une livraison (passage à "En cours")
  const handleStartLivraison = async (livraisonId) => {
    try {
      const response = await LivreurService.updateLivraisonStatus(livraisonId, 'in_progress');
      
      if (response.data.success) {
        toast.success("La livraison a bien été démarrée");
        
        // Mettre à jour la livraison localement
        setLivraisons(prevLivraisons => 
          prevLivraisons.map(livraison => 
            livraison.id === livraisonId 
              ? { ...livraison, status: 'in_progress' } 
              : livraison
          )
        );
      } else {
        toast.error(response.data?.message || "Erreur lors du démarrage de la livraison");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la livraison:", error);
      toast.error(error.response?.data?.message || error.message || "Impossible de démarrer cette livraison");
    }
  };
  
  // Gérer le marquage d'une livraison comme livrée
  const handleMarkDelivered = async (livraisonId) => {
    try {
      const response = await LivreurService.updateLivraisonStatus(livraisonId, 'delivered');
      
      if (response.data.success) {
        toast.success("Livraison marquée comme livrée. L'administrateur va être notifié pour validation.");
        
        // Mettre à jour la livraison localement
        setLivraisons(prevLivraisons => 
          prevLivraisons.map(livraison => 
            livraison.id === livraisonId 
              ? { ...livraison, status: 'delivered' } 
              : livraison
          )
        );
      } else {
        toast.error(response.data?.message || "Erreur lors du marquage de la livraison comme livrée");
      }
    } catch (error) {
      console.error("Erreur lors du marquage de la livraison comme livrée:", error);
      toast.error(error.response?.data?.message || error.message || "Impossible de marquer cette livraison comme livrée");
    }
  };
  
  const handleCancelLivraison = async (livraisonId) => {
    try {
      const response = await LivreurService.cancelLivraison(livraisonId);
      
      if (response.data.success) {
        toast.success("Livraison annulée avec succès");
        
        // Attendre un peu avant de montrer le message sur les annonces disponibles
        setTimeout(() => {
          toast.info(
            <div>
              <p>L'annonce est à nouveau disponible pour d'autres livreurs.</p>
              <Link 
                to="/livreur/annonces"
                className="text-blue-500 underline"
              >
                Voir les annonces
              </Link>
            </div>,
            {
              autoClose: 10000,
              closeButton: true,
            }
          );
        }, 1500);
        
        // Supprimer la livraison de la liste locale (au lieu de changer juste le statut)
        setLivraisons(prevLivraisons => 
          prevLivraisons.filter(livraison => livraison.id !== livraisonId)
        );
      } else {
        toast.error(response.data?.message || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation de la livraison:", error);
      console.error("Détails:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || "Impossible d'annuler cette livraison");
    }
  };

  const filteredLivraisons = filterStatus === 'all' 
    ? livraisons 
    : livraisons.filter(livraison => livraison.status === filterStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-600">Mes livraisons</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'all' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('all')}
          >
            Toutes
          </button>
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('pending')}
          >
            En attente
          </button>
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('accepted')}
          >
            Acceptées
          </button>
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'in_progress' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('in_progress')}
          >
            En cours
          </button>
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('delivered')}
          >
            Livrées
          </button>
          <button 
            className={`px-3 py-1 rounded ${
              filterStatus === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setFilterStatus('canceled')}
          >
            Annulées
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredLivraisons.length > 0 ? (
        <div>
          {filteredLivraisons.map(livraison => (
            <LivraisonCard 
              key={livraison.id} 
              livraison={livraison}
              onCancelLivraison={handleCancelLivraison}
              onStartLivraison={handleStartLivraison}
              onMarkDelivered={handleMarkDelivered}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Aucune livraison trouvée pour ce filtre</p>
          <Link 
            to="/livreur/annonces"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Voir les annonces disponibles
          </Link>
        </div>
      )}
    </div>
  );
};

export default Livraisons;
