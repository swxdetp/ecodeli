import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminService from '../../api/admin.service';
import axios from 'axios';

function AdminLivraisons() {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    livreur_id: ''
  });
  const [filter, setFilter] = useState('in_progress'); // Par défaut, on affiche les livraisons en cours

  useEffect(() => {
    fetchLivraisons();
  }, []);

  const fetchLivraisons = async () => {
    setLoading(true);
    try {
      // Ajout du paramètre status pour le filtrage côté API
      const params = filter !== 'all' ? { status: filter } : {};
      console.log('Filtres appliqués:', params);
      
      // Données mocquées pour tester l'affichage
      // Utilisons ces données temporaires pour vérifier si le composant peut bien afficher des livraisons
      console.log('TEST: Utilisation de données mocquées pour tester l\'affichage');
      const mockLivraisons = [
        {
          id: 1,
          status: 'pending',
          created_at: '2023-07-01 10:00:00',
          updated_at: '2023-07-01 10:00:00',
          annonce: {
            id: 1,
            title: 'Livraison de test 1'
          },
          livreur: {
            id: 10,
            name: 'Livreur Test'
          }
        },
        {
          id: 2,
          status: 'accepted',
          created_at: '2023-07-02 11:00:00',
          updated_at: '2023-07-02 11:30:00',
          annonce: {
            id: 2,
            title: 'Livraison de test 2'
          },
          livreur: {
            id: 11,
            name: 'Livreur Test 2'
          }
        }
      ];
      
      console.log('Données mocquées pour test:', mockLivraisons);
      setLivraisons(mockLivraisons);
      
      /* Version originale - désactivée temporairement pour test
      // Appel à l'API avec débogage détaillé
      console.log('Appel de AdminService.getAllLivraisons...');
      const response = await AdminService.getAllLivraisons(params);
      console.log('Réponse complète de getAllLivraisons:', response);
      
      // Vérifier la structure de la réponse
      if (response && response.success === true && Array.isArray(response.data)) {
        console.log('Données des livraisons reçues:', response.data);
        console.log('Nombre de livraisons:', response.data.length);
        setLivraisons(response.data);
      } else if (response && response.data) {
        console.log('Structure de réponse différente, data présent:', response.data);
        setLivraisons(response.data);
      } else {
        console.warn('Réponse reçue mais sans données valides:', response);
        setLivraisons([]);
      }
      */
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      console.error('Détails de l\'erreur:', error.response || error.message || error);
      toast.error('Impossible de charger la liste des livraisons');
      // Réinitialiser l'état pour éviter de potentielles données incomplètes
      setLivraisons([]);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer un filtre et recharger les données
  const applyFilter = (newFilter) => {
    setFilter(newFilter);
    // Re-interroger l'API avec le nouveau filtre
    fetchLivraisons();
  };

  // Effet pour recharger les données lorsque le filtre change
  useEffect(() => {
    console.log('AdminLivraisons - Composant monté ou filtre changé:', filter);
    fetchLivraisons();
    
    // Logs supplémentaires pour débogage
    console.log('====== DÉBOGAGE ADMIN LIVRAISONS ======');
    console.log('Vérifions le service:');
    try {
      // Tester la requête directement avec fetch pour diagnostiquer les problèmes d'API
      fetch('/api/public/livraisons')
        .then(response => {
          console.log('Réponse fetch brute:', response);
          return response.json();
        })
        .then(data => {
          console.log('Données fetch brutes:', data);
        })
        .catch(error => {
          console.error('Erreur fetch brute:', error);
        });
    } catch (e) {
      console.error('Erreur de test fetch:', e);
    }
  }, [filter]);

  // Ouvrir la modal des détails
  const handleViewDetails = (livraison) => {
    setSelectedLivraison(livraison);
    setModalOpen(true);
  };

  // Ouvrir la modal d'édition
  const handleEditLivraison = (livraison) => {
    setSelectedLivraison(livraison);
    setEditFormData({
      status: livraison.status,
      livreur_id: livraison.livreur?.id || ''
    });
    setEditModalOpen(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.put(`/api/admin/livraisons/${selectedLivraison.id}`, editFormData);

      if (response.data.success) {
        toast.success('Livraison mise à jour avec succès');
        fetchLivraisons();
        setEditModalOpen(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour : ' + error.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la modal de confirmation d'annulation
  const handleCancelLivraison = (livraison) => {
    setSelectedLivraison(livraison);
    setConfirmModalOpen(true);
  };

  // Confirmer l'annulation de la livraison
  const confirmCancelLivraison = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/livraisons/${selectedLivraison.id}`);

      if (response.data.success) {
        toast.success('Livraison annulée avec succès');
        fetchLivraisons();
        setConfirmModalOpen(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation : ' + error.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (livraisonId, newStatus) => {
    try {
      await AdminService.updateLivraison(livraisonId, { status: newStatus });
      toast.success(`Statut de la livraison mis à jour avec succès`);
      fetchLivraisons();
      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut de cette livraison');
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Traduire les statuts en français
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  };

  // Obtenir la couleur de badge selon le statut
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-0">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des livraisons</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </Link>
        </div>
        
        {/* Filtrage des livraisons */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrer les livraisons</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              En cours
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              Terminées
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              Annulées
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Chargement des livraisons...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annonce
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livreur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {livraisons.length > 0 ? (
                  livraisons.map(livraison => (
                    <tr key={livraison.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {livraison.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        #{livraison.annonce_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {livraison.livreur?.name || 'Non assigné'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {livraison.client?.name || 'Inconnu'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(livraison.status)}`}>
                          {translateStatus(livraison.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(livraison.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(livraison)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100"
                          title="Voir les détails"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditLivraison(livraison)}
                          className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded-md bg-yellow-50 hover:bg-yellow-100"
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCancelLivraison(livraison)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100"
                          title="Annuler"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      Aucune livraison trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Modal pour voir les détails d'une livraison */}
      {modalOpen && selectedLivraison && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-lg z-20">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Détails de la livraison #{selectedLivraison.id}</h2>
                
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Annonce</h3>
                        <p>#{selectedLivraison.annonce_id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                        <p>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(selectedLivraison.status)}`}>
                            {translateStatus(selectedLivraison.status)}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p>{selectedLivraison.client?.name || 'Inconnu'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Livreur</h3>
                      <p>{selectedLivraison.livreur?.name || 'Non assigné'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">De</h3>
                      <p>{selectedLivraison.annonce?.address_from || 'Adresse non spécifiée'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">À</h3>
                      <p>{selectedLivraison.annonce?.address_to || 'Adresse non spécifiée'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date de livraison prévue</h3>
                      <p>{formatDate(selectedLivraison.annonce?.date_to)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Créée le</h3>
                      <p>{formatDate(selectedLivraison.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Changer le statut</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedLivraison.id, 'pending')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium hover:bg-yellow-200"
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLivraison.id, 'in_progress')}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200"
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLivraison.id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200"
                    >
                      Terminée
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLivraison.id, 'cancelled')}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                    >
                      Annulée
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLivraisons;
