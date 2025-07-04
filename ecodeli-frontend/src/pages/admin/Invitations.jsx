import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminService from '../../api/admin.service';

function AdminInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      // Appel à l'API pour récupérer les invitations en attente
      const response = await AdminService.getPendingInvitations();
      setInvitations(Array.isArray(response.data) ? response.data : []);
      
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        toast.info('Aucune invitation en attente');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des invitations:', error);
      toast.error(`Impossible de charger la liste des invitations: ${error.response?.status || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (invitation) => {
    setSelectedInvitation(invitation);
    setDetailsModalOpen(true);
  };

  const openRejectModal = (invitation) => {
    setSelectedInvitation(invitation);
    setRejectModalOpen(true);
  };

  const handleAccept = async (invitationId) => {
    try {
      await AdminService.acceptInvitation(invitationId);
      toast.success('Invitation acceptée avec succès');
      fetchInvitations();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedInvitation) return;
    
    try {
      await AdminService.rejectInvitation(selectedInvitation.id, { reason: rejectReason });
      toast.success('Invitation rejetée');
      setRejectModalOpen(false);
      setRejectReason('');
      fetchInvitations();
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      livreur: 'bg-blue-100 text-blue-800',
      commercant: 'bg-yellow-100 text-yellow-800',
      prestataire: 'bg-purple-100 text-purple-800'
    };
    
    return roles[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Demandes d'invitation</h1>
          <button
            onClick={fetchInvitations}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {invitations.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune invitation en attente</h3>
                <p className="mt-1 text-gray-500">Toutes les demandes d'inscription ont été traitées.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de compte</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{invitation.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invitation.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(invitation.role)}`}>
                            {invitation.role === 'livreur' ? 'Livreur' : invitation.role === 'commercant' ? 'Commerçant' : 'Prestataire'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invitation.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openDetailsModal(invitation)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleAccept(invitation.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => openRejectModal(invitation)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Refuser
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal pour voir les détails */}
      {detailsModalOpen && selectedInvitation && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setDetailsModalOpen(false)}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                      Détails de la demande
                    </h3>
                    <div className="mt-2">
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Informations personnelles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium">{selectedInvitation.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedInvitation.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Type de compte</p>
                            <p className="font-medium capitalize">{selectedInvitation.role}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{selectedInvitation.phone || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Informations spécifiques selon le rôle */}
                      {selectedInvitation.role === 'livreur' && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Informations livreur</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Véhicule</p>
                              <p className="font-medium">{selectedInvitation.vehicle_type || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Zone de livraison</p>
                              <p className="font-medium">{selectedInvitation.delivery_area || 'Non renseignée'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Expérience</p>
                              <p className="font-medium">{selectedInvitation.experience || 'Non renseignée'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedInvitation.role === 'commercant' && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Informations commerçant</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nom du commerce</p>
                              <p className="font-medium">{selectedInvitation.business_name || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Type de commerce</p>
                              <p className="font-medium">{selectedInvitation.business_type || 'Non renseigné'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Adresse</p>
                              <p className="font-medium">{selectedInvitation.address || 'Non renseignée'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">SIRET</p>
                              <p className="font-medium">{selectedInvitation.siret || 'Non renseigné'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {selectedInvitation.documents && selectedInvitation.documents.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Documents fournis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedInvitation.documents.map((doc, index) => (
                              <div key={index} className="border border-gray-200 rounded-md p-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div className="flex-grow overflow-hidden">
                                  <p className="font-medium truncate">{doc.name || `Document ${index + 1}`}</p>
                                  <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                                </div>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleAccept(selectedInvitation.id);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    openRejectModal(selectedInvitation);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour rejeter une invitation */}
      {rejectModalOpen && selectedInvitation && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setRejectModalOpen(false)}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Refuser la demande
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir refuser cette demande d'inscription ? Cette action ne peut pas être annulée.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
                          Motif du refus (optionnel)
                        </label>
                        <textarea
                          id="reject-reason"
                          name="reject-reason"
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Expliquez la raison du refus..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Refuser
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvitations;
