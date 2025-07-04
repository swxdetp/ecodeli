import React, { useState } from 'react';
import { FaFileUpload, FaIdCard, FaCertificate, FaTrash, FaCheck, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * Composant pour la gestion des documents du prestataire
 * (pièce d'identité, certifications, diplômes, etc.)
 */
const DocumentsProfil = ({ documents = [], onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('identity');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5Mo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Taille maximale: 5Mo");
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format de fichier non supporté. Formats acceptés: PDF, JPEG, PNG");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('type', documentType);
      
      // Appel à l'API via la fonction onUpload passée en props
      await onUpload(formData, documentType);
      
      // Réinitialiser après téléchargement
      setSelectedFile(null);
      document.getElementById('file-upload').value = '';
      
      toast.success("Document téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement du document");
    } finally {
      setUploading(false);
    }
  };

  // Obtenir le nom et l'icône pour un type de document
  const getDocumentTypeInfo = (type) => {
    switch(type) {
      case 'identity':
        return { name: "Pièce d'identité", icon: <FaIdCard className="text-blue-500" /> };
      case 'certification':
        return { name: "Certification", icon: <FaCertificate className="text-green-500" /> };
      case 'diploma':
        return { name: "Diplôme", icon: <FaCertificate className="text-purple-500" /> };
      case 'insurance':
        return { name: "Attestation d'assurance", icon: <FaFileUpload className="text-red-500" /> };
      default:
        return { name: "Document", icon: <FaFileUpload className="text-gray-500" /> };
    }
  };

  // Obtenir la classe de statut
  const getStatusClass = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <FaCheck className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'rejected':
        return <FaTrash className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FaFileUpload className="mr-2 text-purple-600" />
        Documents et certifications
      </h3>
      
      {/* Formulaire d'upload */}
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Télécharger un nouveau document</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              id="document-type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="identity">Pièce d'identité</option>
              <option value="certification">Certification</option>
              <option value="diploma">Diplôme</option>
              <option value="insurance">Attestation d'assurance</option>
              <option value="other">Autre document</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Fichier (PDF, JPEG, PNG - max 5Mo)
            </label>
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`inline-flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              !selectedFile || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Téléchargement...
              </>
            ) : (
              <>
                <FaFileUpload className="mr-2" />
                Télécharger
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Liste des documents existants */}
      <h4 className="font-medium text-gray-700 mb-3">Documents téléchargés</h4>
      
      {documents.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Aucun document téléchargé</p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => {
            const typeInfo = getDocumentTypeInfo(document.type);
            const statusClass = getStatusClass(document.status);
            const statusIcon = getStatusIcon(document.status);
            
            return (
              <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  {typeInfo.icon}
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{typeInfo.name}</p>
                    <p className="text-sm text-gray-500">
                      Téléchargé le {new Date(document.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {statusIcon}
                    <span className="ml-1">
                      {document.status === 'approved' && 'Approuvé'}
                      {document.status === 'pending' && 'En attente'}
                      {document.status === 'rejected' && 'Refusé'}
                    </span>
                  </span>
                  
                  <div className="ml-4 flex space-x-2">
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none" 
                      title="Voir le document"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button 
                      className="p-1 text-red-400 hover:text-red-600 focus:outline-none" 
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsProfil;
