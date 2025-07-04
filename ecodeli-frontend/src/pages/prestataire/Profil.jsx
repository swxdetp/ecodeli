import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import InformationsProfil from '../../components/prestataire/InformationsProfil';
import DocumentsProfil from '../../components/prestataire/DocumentsProfil';
import PrestataireService from '../../api/prestataire.service';
import useAuthStore from '../../store/authStore';

/**
 * Page de profil pour les prestataires
 * Permet de gérer les informations personnelles et les documents
 */
const PrestataireProfil = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([
    // Données factices pour l'affichage en développement
    {
      id: 1,
      type: 'identity',
      filename: 'carte_identite.pdf',
      uploaded_at: '2025-06-15T10:30:00',
      status: 'approved'
    },
    {
      id: 2,
      type: 'certification',
      filename: 'certification_service.pdf',
      uploaded_at: '2025-06-20T14:45:00',
      status: 'pending'
    }
  ]);

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getProfil();
        // if (response.data && response.data.success) {
        //   setUser(response.data.data);
        //   setDocuments(response.data.data.documents || []);
        // }
        
        // Pour le développement, nous utilisons les données du store d'authentification
        
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Impossible de charger les données du profil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]);

  // Mettre à jour les informations du profil
  const handleSaveProfile = async (formData) => {
    try {
      setIsSaving(true);
      
      // En production, utiliser l'API réelle
      // const response = await PrestataireService.updateProfil(formData);
      
      // Simuler un délai pour le développement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mise à jour du state global
      setUser({
        ...user,
        ...formData
      });
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Impossible de mettre à jour le profil");
    } finally {
      setIsSaving(false);
    }
  };

  // Télécharger un document
  const handleUploadDocument = async (formData, type) => {
    try {
      // En production, utiliser l'API réelle
      // const response = await PrestataireService.uploadDocument(formData);
      
      // Simuler un délai pour le développement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ajouter le document à la liste
      const newDocument = {
        id: Date.now(), // Simuler un ID unique
        type,
        filename: formData.get('document').name,
        uploaded_at: new Date().toISOString(),
        status: 'pending'
      };
      
      setDocuments(prev => [newDocument, ...prev]);
      
      return newDocument;
    } catch (error) {
      console.error("Erreur lors du téléchargement du document:", error);
      throw new Error("Impossible de télécharger le document");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Mon profil prestataire</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <InformationsProfil 
            user={user} 
            onSave={handleSaveProfile}
            isSaving={isSaving}
          />
          
          {/* Documents et certifications */}
          <DocumentsProfil 
            documents={documents}
            onUpload={handleUploadDocument}
          />
        </div>
        
        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Carte de profil */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-purple-600 p-4 text-white">
              <h3 className="font-semibold">Votre profil</h3>
            </div>
            <div className="p-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-gray-500">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <h4 className="text-center font-semibold text-lg">{user?.name || 'Prestataire'}</h4>
              <p className="text-center text-gray-500 text-sm">{user?.email || 'email@exemple.com'}</p>
              
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    Actif
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Vérification</span>
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    {documents.some(doc => doc.status === 'approved') ? 'Vérifié' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Guide d'aide */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-blue-600 p-4 text-white">
              <h3 className="font-semibold">Conseils</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Complétez votre profil pour augmenter vos chances d'être sélectionné par les clients.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Téléchargez vos documents pour obtenir la vérification de votre compte.</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Maintenir un taux de satisfaction élevé est essentiel pour recevoir plus de demandes.</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Assistance */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-green-600 p-4 text-white">
              <h3 className="font-semibold">Besoin d'aide ?</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Notre équipe d'assistance est disponible pour vous aider avec toute question ou problème.
              </p>
              <a 
                href="mailto:support@ecodeli.fr" 
                className="block w-full py-2 px-4 bg-green-600 text-white rounded text-center text-sm hover:bg-green-700"
              >
                Contacter l'assistance
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestataireProfil;
