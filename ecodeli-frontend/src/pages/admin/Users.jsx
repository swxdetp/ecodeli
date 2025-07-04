import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminService from '../../api/admin.service';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const [debugInfo, setDebugInfo] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Tentative de récupération des utilisateurs...');
      const response = await AdminService.getAllUsers();
      console.log('Réponse API brute:', response);
      
      // Déterminer la structure et extraire les données utilisateur
      let userData = [];
      
      // Vérifier différentes structures de réponse possibles
      if (response && response.data) {
        // Format Laravel ApiResponder: { success, message, data }
        userData = response.data;
      } else if (response && Array.isArray(response)) {
        // Format tableau direct
        userData = response;
      } else if (response && typeof response === 'object') {
        // Autre format objet
        userData = response;
      }
      
      console.log('Données utilisateurs extraites:', userData);
      
      // Stocker les informations de débogage
      setDebugInfo({
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: !!userData,
        dataLength: Array.isArray(userData) ? userData.length : 'N/A',
        userData: userData
      });
      
      // Définir les utilisateurs
      setUsers(Array.isArray(userData) ? userData : []);
      
      if (!userData || (Array.isArray(userData) && userData.length === 0)) {
        toast.warning('Aucun utilisateur trouvé dans la base de données');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      console.log('Détails de l\'erreur:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'Pas de réponse',
        request: error.request ? 'Requête envoyée mais pas de réponse' : 'Problème avant envoi de la requête'
      });
      
      // Stocker les informations de débogage d'erreur
      setDebugInfo({
        error: true,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'Pas de réponse',
        request: error.request ? 'Requête envoyée mais pas de réponse' : 'Problème avant envoi de la requête'
      });
      
      toast.error(`Impossible de charger la liste des utilisateurs: ${error.response?.status || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || 'client',
        password: '' // Ne pas pré-remplir le mot de passe
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'client',
        password: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        // Mise à jour d'un utilisateur existant
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password; // Ne pas envoyer le mot de passe s'il est vide
        }
        
        await AdminService.updateUser(selectedUser.id, dataToSend);
        toast.success(`L'utilisateur ${formData.name} a été mis à jour avec succès`);
      } else {
        // Création d'un nouvel utilisateur
        await AdminService.createUser(formData);
        toast.success(`L'utilisateur ${formData.name} a été créé avec succès`);
      }
      
      setModalOpen(false);
      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ?`)) {
      try {
        await AdminService.deleteUser(userId);
        toast.success(`L'utilisateur ${userName} a été supprimé avec succès`);
        fetchUsers(); // Rafraîchir la liste
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer cet utilisateur');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-0">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </Link>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un utilisateur
        </button>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Chargement des utilisateurs...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                          ${user.role === 'client' ? 'bg-green-100 text-green-800' : ''}
                          ${user.role === 'livreur' ? 'bg-blue-100 text-blue-800' : ''}
                          ${user.role === 'commercant' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Modal pour ajouter/modifier un utilisateur */}
      {modalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-lg z-20">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedUser ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Nom
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                      Rôle
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="client">Client</option>
                      <option value="livreur">Livreur</option>
                      <option value="commercant">Commerçant</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      {selectedUser ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      {...(selectedUser ? {} : { required: true })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {selectedUser ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
