import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Service temporaire pour gérer les livraisons en attente de validation
const adminLivraisonService = {
  getPendingLivraisons: () => {
    return axios.get('/admin/livraisons/pending');
  },
  validateLivraison: (id) => {
    return axios.put(`/admin/livraisons/${id}/validate`);
  },
  refuseLivraison: (id, reason) => {
    return axios.put(`/admin/livraisons/${id}/refuse`, { reason });
  }
};
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

const LivraisonsValidation = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLivraisons();
  }, []);

  const loadLivraisons = async () => {
    try {
      setLoading(true);
      const response = await adminLivraisonService.getPendingLivraisons();
      setLivraisons(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons à valider:', error);
      toast.error('Impossible de charger les livraisons à valider');
      setLoading(false);
    }
  };

  const handleValidateClick = async (livraison) => {
    try {
      await adminLivraisonService.validateLivraison(livraison.id);
      toast.success('Livraison validée avec succès');
      loadLivraisons(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la validation de la livraison:', error);
      toast.error('Erreur lors de la validation de la livraison');
    }
  };

  const openRefuseModal = (livraison) => {
    setSelectedLivraison(livraison);
    setRefuseReason('');
    setIsModalOpen(true);
  };

  const handleRefuseSubmit = async () => {
    if (refuseReason.trim().length < 5) {
      toast.error('Veuillez fournir une raison de refus (minimum 5 caractères)');
      return;
    }

    try {
      await adminLivraisonService.refuseLivraison(selectedLivraison.id, refuseReason);
      toast.success('Livraison refusée avec succès');
      setIsModalOpen(false);
      loadLivraisons(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du refus de la livraison:', error);
      toast.error('Erreur lors du refus de la livraison');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Livraisons à valider</h1>
      
      {loading ? (
        <LoadingSpinner />
      ) : livraisons.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p className="text-center text-gray-500">Aucune livraison en attente de validation.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {livraisons.map((livraison) => (
            <div key={livraison.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold mb-2">
                  {livraison.annonce?.title || 'Livraison sans titre'}
                </h2>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  À valider
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Livreur:</span>{' '}
                  {livraison.livreur ? livraison.livreur.name : 'Non assigné'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">De:</span> {livraison.annonce?.address_from || 'Non spécifié'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">À:</span> {livraison.annonce?.address_to || 'Non spécifié'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date de livraison:</span>{' '}
                  {new Date(livraison.delivery_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Prix:</span> {livraison.annonce?.price || '0'} €
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleValidateClick(livraison)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-1"
                >
                  Valider
                </button>
                <button
                  onClick={() => openRefuseModal(livraison)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-1"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de refus */}
      {isModalOpen && selectedLivraison && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Refuser la livraison</h3>
            <p className="mb-4 text-sm text-gray-600">
              Veuillez indiquer la raison du refus de la livraison. Cette information sera visible par le livreur.
            </p>
            
            <div className="mb-4">
              <label htmlFor="refuseReason" className="block mb-1 font-medium">
                Raison du refus
              </label>
              <textarea
                id="refuseReason"
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                placeholder="Expliquez pourquoi cette livraison est refusée..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRefuseSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonsValidation;
