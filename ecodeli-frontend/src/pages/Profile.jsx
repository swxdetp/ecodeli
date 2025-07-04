import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';
import AuthService from '../api/auth.service';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  
  // Vérifier si l'utilisateur a un rôle nécessitant un document d'identité
  const requiresIdentityDocument = user && ['livreur', 'prestataire', 'commercant'].includes(user.role);
  
  // Charger les documents d'identité si l'utilisateur a un rôle concerné
  useEffect(() => {
    if (requiresIdentityDocument) {
      fetchUserDocuments();
    }
  }, [requiresIdentityDocument]);
  
  // Fonction pour récupérer les documents d'identité
  const fetchUserDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await AuthService.getUserDocuments();
      if (response.success && response.data) {
        setUserDocuments(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      toast.error('Impossible de charger vos documents');
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  // Fonction pour télécharger un document
  const handleDocumentDownload = async (documentId) => {
    try {
      await AuthService.downloadDocument(documentId);
      toast.success('Téléchargement du document réussi');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Impossible de télécharger le document');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.current_password) {
      newErrors.current_password = 'Mot de passe actuel requis';
    }
    if (!formData.password) {
      newErrors.password = 'Nouveau mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await AuthService.updatePassword(formData);
      toast.success('Mot de passe modifié avec succès');
      setIsEditing(false);
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
    } catch (error) {
      console.error('Erreur lors de la modification du mot de passe:', error);
      const serverErrors = error.response?.data?.errors || {};
      
      // Transform server validation errors to match our format
      const formattedErrors = {};
      Object.keys(serverErrors).forEach(key => {
        formattedErrors[key] = serverErrors[key][0]; // Take first error message
      });
      
      setErrors(formattedErrors);
      toast.error(error.response?.data?.message || 'Échec de la modification du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>
            
            {/* Section des documents d'identité pour les rôles concernés */}
            {requiresIdentityDocument && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Documents d'identité</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  {loadingDocuments ? (
                    <p className="text-gray-600">Chargement de vos documents...</p>
                  ) : userDocuments.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Documents associés à votre compte :</p>
                      {userDocuments.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-200">
                          <div>
                            <p className="font-medium">{doc.document_type || 'Document d\'identité'}</p>
                            <p className="text-xs text-gray-500">
                              Status: <span className={`font-medium ${doc.status === 'approved' ? 'text-green-600' : doc.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                                {doc.status === 'approved' ? 'Validé' : doc.status === 'pending' ? 'En attente' : 'Refusé'}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDocumentDownload(doc.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            Télécharger
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Aucun document disponible.</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations personnelles</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{user?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="font-medium capitalize">{user?.role || 'client'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="font-medium">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Sécurité</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded transition"
                  >
                    Modifier
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel*
                      </label>
                      <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.current_password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.current_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe*
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe*
                      </label>
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            current_password: '',
                            password: '',
                            password_confirmation: ''
                          });
                          setErrors({});
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isLoading}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Modification en cours...' : 'Enregistrer les modifications'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm text-gray-500">Mot de passe</p>
                    <p className="font-medium">••••••••</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
