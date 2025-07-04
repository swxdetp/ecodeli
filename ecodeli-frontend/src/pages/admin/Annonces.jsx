import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminService from '../../api/admin.service';

function AdminAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    setLoading(true);
    try {
      console.log('Tentative de récupération des annonces...');
      const response = await AdminService.getAllAnnonces();
      console.log('Réponse API annonces brute:', response);
      
      // Déterminer la structure et extraire les données des annonces
      let annoncesData = [];
      
      console.log('Structure complète de la réponse:', response);
      
      // Vérifier différentes structures de réponse possibles
      if (response && response.data && response.data.data) {
        // Format Laravel ApiResponder paginé: { success, message, data: { current_page, data: [...], ... } }
        console.log('Annonces trouvées dans response.data.data (pagination Laravel)');
        annoncesData = response.data.data;
      } else if (response && response.data) {
        // Format Laravel ApiResponder simple: { success, message, data: [...] }
        console.log('Annonces trouvées dans response.data');
        annoncesData = response.data;
      } else if (response && Array.isArray(response)) {
        // Format tableau direct
        console.log('Annonces trouvées directement dans response (tableau)');
        annoncesData = response;
      } else if (response && typeof response === 'object') {
        // Autre format objet
        console.log('Annonces trouvées dans response (objet)');
        annoncesData = response;
      }
      
      console.log('Données annonces extraites:', annoncesData);
      
      // Définir les annonces
      setAnnonces(Array.isArray(annoncesData) ? annoncesData : []);
      
      if (!annoncesData || (Array.isArray(annoncesData) && annoncesData.length === 0)) {
        toast.warning('Aucune annonce trouvée dans la base de données');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      console.log('Détails de l\'erreur:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'Pas de réponse',
        request: error.request ? 'Requête envoyée mais pas de réponse' : 'Problème avant envoi de la requête'
      });
      toast.error(`Impossible de charger la liste des annonces: ${error.response?.status || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    address_from: '',
    address_to: '',
    date_from: '',
    date_to: '',
    type: '',
    description: '',
    weight: '',
    volume: '',
    status: ''
  });

  const handleViewDetails = (annonce) => {
    setSelectedAnnonce(annonce);
    setFormData({
      address_from: annonce.address_from || '',
      address_to: annonce.address_to || '',
      date_from: annonce.date_from ? new Date(annonce.date_from).toISOString().split('T')[0] : '',
      date_to: annonce.date_to ? new Date(annonce.date_to).toISOString().split('T')[0] : '',
      type: annonce.type || '',
      description: annonce.description || '',
      weight: annonce.weight || '',
      volume: annonce.volume || '',
      status: annonce.status || ''
    });
    setEditMode(false);
    setModalOpen(true);
  };
  
  const handleEdit = (annonce) => {
    // Si une annonce est passée en paramètre, on la sélectionne d'abord
    if (annonce) {
      setSelectedAnnonce(annonce);
      setFormData({
        address_from: annonce.address_from || '',
        address_to: annonce.address_to || '',
        date_from: annonce.date_from ? new Date(annonce.date_from).toISOString().split('T')[0] : '',
        date_to: annonce.date_to ? new Date(annonce.date_to).toISOString().split('T')[0] : '',
        type: annonce.type || '',
        description: annonce.description || '',
        weight: annonce.weight || '',
        volume: annonce.volume || '',
        status: annonce.status || ''
      });
      setModalOpen(true);
    }
    // Activer le mode édition
    setEditMode(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSave = async () => {
    try {
      await AdminService.updateAnnonce(selectedAnnonce.id, formData);
      toast.success('Annonce mise à jour avec succès');
      setEditMode(false);
      fetchAnnonces(); // Rafraîchir la liste
      setModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Impossible de mettre à jour cette annonce');
    }
  };

  const handleDelete = async (annonceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await AdminService.deleteAnnonce(annonceId);
        toast.success('L\'annonce a été supprimée avec succès');
        fetchAnnonces();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer cette annonce');
      }
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

  return (
    <div className="min-h-screen bg-gray-100 pt-0">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des annonces</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Chargement des annonces...</div>
          ) : (
            <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
              {annonces.length > 0 ? (
                annonces.map(annonce => (
                  <div key={annonce.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">#{annonce.id}</span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {annonce.title || `Livraison #${annonce.id}`}
                        </h3>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {annonce.type || 'Standard'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${annonce.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${annonce.status === 'en_cours' ? 'bg-blue-100 text-blue-800' : ''}
                        ${annonce.status === 'terminee' ? 'bg-green-100 text-green-800' : ''}
                        ${annonce.status === 'annulee' ? 'bg-red-100 text-red-800' : ''}
                        ${!annonce.status ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {annonce.status === 'en_attente' ? 'En attente' : 
                         annonce.status === 'en_cours' ? 'En cours' :
                         annonce.status === 'terminee' ? 'Terminée' : 
                         annonce.status === 'annulee' ? 'Annulée' : 
                         annonce.status || 'Non défini'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="block text-xs font-medium text-gray-500">De</span>
                        <span className="block">{annonce.address_from}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-500">À</span>
                        <span className="block">{annonce.address_to}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-500">Date</span>
                        <span className="block">{formatDate(annonce.date_to)}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-500">Client</span>
                        <span className="block">{annonce.user?.name || 'Utilisateur inconnu'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 border-t pt-3">
                      <button
                        onClick={() => handleViewDetails(annonce)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Détails
                      </button>

                      <button
                        onClick={() => handleEdit(annonce)}
                        className="inline-flex items-center px-3 py-1.5 border border-green-600 text-green-600 hover:bg-green-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(annonce.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-600 text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  Aucune annonce trouvée
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal pour voir les détails d'une annonce */}
      {modalOpen && selectedAnnonce && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-lg z-20">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Détails de l'annonce #{selectedAnnonce.id}</h2>
                  {!editMode ? (
                    <button 
                      onClick={handleEdit}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                  ) : (
                    <button 
                      onClick={handleSave}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Enregistrer
                    </button>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p>{selectedAnnonce.user?.name || 'Utilisateur inconnu'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Adresse de départ</h3>
                      {editMode ? (
                        <input
                          type="text"
                          name="address_from"
                          value={formData.address_from}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        <p>{selectedAnnonce.address_from}</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Adresse de livraison</h3>
                      {editMode ? (
                        <input
                          type="text"
                          name="address_to"
                          value={formData.address_to}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      ) : (
                        <p>{selectedAnnonce.address_to}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date de départ</h3>
                        {editMode ? (
                          <input
                            type="date"
                            name="date_from"
                            value={formData.date_from}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          <p>{formatDate(selectedAnnonce.date_from)}</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date de livraison</h3>
                        {editMode ? (
                          <input
                            type="date"
                            name="date_to"
                            value={formData.date_to}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          <p>{formatDate(selectedAnnonce.date_to)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Type de colis</h3>
                      {editMode ? (
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="petit">Petit</option>
                          <option value="moyen">Moyen</option>
                          <option value="grand">Grand</option>
                        </select>
                      ) : (
                        <p>{selectedAnnonce.type}</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p>{selectedAnnonce.description || 'Aucune description'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${selectedAnnonce.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${selectedAnnonce.status === 'en_cours' ? 'bg-blue-100 text-blue-800' : ''}
                          ${selectedAnnonce.status === 'terminee' ? 'bg-green-100 text-green-800' : ''}
                          ${selectedAnnonce.status === 'annulee' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {selectedAnnonce.status === 'en_attente' ? 'En attente' : 
                           selectedAnnonce.status === 'en_cours' ? 'En cours' :
                           selectedAnnonce.status === 'terminee' ? 'Terminée' : 
                           selectedAnnonce.status === 'annulee' ? 'Annulée' : selectedAnnonce.status}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Créée le</h3>
                      <p>{formatDate(selectedAnnonce.created_at)}</p>
                    </div>
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

export default AdminAnnonces;
