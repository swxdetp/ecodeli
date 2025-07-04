import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import LivreurService from '../../api/livreur.service';
import AuthService from '../../api/auth.service';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCar, FaIdCard, FaSpinner, FaFileDownload } from 'react-icons/fa';
import ReviewsSection from '../../components/livreur/ReviewsSection';
import useAuthStore from '../../store/authStore';

const Profil = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const fileInputRef = useRef(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: ''
  });
  
  useEffect(() => {
    fetchProfile();
    fetchUserDocuments();
  }, []);
  
  // Fonction pour récupérer les documents d'identité
  const fetchUserDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await LivreurService.getDocuments();
      if (response.data && response.data.success) {
        setUserDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  // Fonction pour télécharger un document
  const handleDownloadDocument = async (documentId) => {
    try {
      await LivreurService.downloadDocument(documentId);
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      toast.error('Impossible de télécharger le document');
    }
  };
  
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await LivreurService.getProfil();
      
      if (response.data && response.data.success) {
        const profilData = response.data.data;
        setFormData({
          name: profilData.name || '',
          email: profilData.email || '',
          phone: profilData.phone || '',
          address: profilData.address || '',
          password: '',
          password_confirmation: ''
        });
        
        // Mettre à jour les infos utilisateur dans le store
        setUser({
          ...user,
          ...profilData
        });
      } else {
        toast.error("Erreur lors de la récupération du profil");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      toast.error("Erreur lors de la récupération du profil");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await LivreurService.updateProfil(formData);
      
      if (response.data && response.data.success) {
        toast.success("Profil mis à jour avec succès");
        
        // Mise à jour des infos utilisateur dans le store si nécessaire
        if (response.data.data) {
          setUser({
            ...user,
            ...response.data.data
          });
        }
        
        // Réinitialiser les champs de mot de passe
        setFormData({
          ...formData,
          password: '',
          password_confirmation: ''
        });
      } else {
        toast.error(response.data?.message || "Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDocumentClick = (type) => {
    fileInputRef.current.click();
  };
  
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingDocument(true);
      const response = await LivreurService.uploadDocument(file);
      
      if (response.data && response.data.success) {
        toast.success("Document uploadé avec succès");
        // Rafraîchir la liste des documents
        fetchUserDocuments();
      } else {
        toast.error("Erreur lors de l'upload du document");
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      toast.error("Erreur lors de l'upload du document");
    } finally {
      setUploadingDocument(false);
      // Réinitialiser le champ de fichier
      e.target.value = '';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-green-500 text-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne de gauche: Profil */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" />
                Informations personnelles
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">Laissez vide pour ne pas changer</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Confirmer mot de passe
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center sm:justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center w-full sm:w-auto"
                    >
                      {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Section Avis Clients */}
            <ReviewsSection />
          </div>
          
          {/* Colonne de droite: Documents */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaIdCard className="mr-2" />
                Mes documents
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {loadingDocuments ? (
                  <div className="p-3 sm:p-4 border rounded-md flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2 text-green-500" />
                    <span>Chargement des documents...</span>
                  </div>
                ) : userDocuments && userDocuments.length > 0 ? (
                  userDocuments.map(document => (
                    <div key={document.id} className="p-3 sm:p-4 border rounded-md">
                      <h3 className="font-semibold mb-2">
                        {document.document_type === 'identity' ? 'Pièce d\'identité' : 
                         document.document_type === 'license' ? 'Permis de conduire' : 
                         'Document d\'identité'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${document.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {document.status === 'approved' ? 'Vérifié' : 
                           document.status === 'pending' ? 'En attente' : 'Refusé'}
                        </span>
                        <button
                          onClick={() => handleDownloadDocument(document.id)}
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded transition-colors"
                        >
                          <FaFileDownload className="mr-1" /> Télécharger
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 sm:p-4 border rounded-md">
                    <p>Aucun document disponible</p>
                    <button 
                      onClick={() => handleDocumentClick('identity')}
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded transition-colors flex items-center"
                    >
                      + Ajouter un document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleDocumentUpload}
        className="hidden"
      />
    </div>
  );
};

export default Profil;
