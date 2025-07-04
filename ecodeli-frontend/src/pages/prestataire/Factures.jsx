import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaDownload, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PrestataireService from '../../api/prestataire.service';

/**
 * Page de gestion des factures pour les prestataires
 * Affiche la liste des factures mensuelles et permet de les télécharger
 */
const PrestataireFactures = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const facturesPerPage = 5;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        setIsLoading(true);
        
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getFactures();
        
        // Pour le développement, utiliser les données mock
        const response = await PrestataireService.mockData.getFactures();
        
        if (response.data && response.data.success) {
          setFactures(response.data.data.factures || []);
          setFilteredFactures(response.data.data.factures || []);
        } else {
          toast.error("Erreur lors de la récupération des factures");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Impossible de charger les factures");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFactures();
  }, []);

  // Filtrer les factures en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFactures(factures);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = factures.filter(facture => 
        facture.numero.toLowerCase().includes(term) || 
        new Date(facture.date).toLocaleDateString().includes(term)
      );
      setFilteredFactures(filtered);
    }
    
    // Réinitialiser la pagination lors d'une recherche
    setCurrentPage(1);
  }, [searchTerm, factures]);

  // Télécharger une facture
  const handleDownload = async (id) => {
    try {
      setDownloadingInvoice(id);
      
      // En production, utiliser l'API réelle
      // const response = await PrestataireService.downloadFacturePDF(id);
      
      // Simuler un délai pour le développement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation de téléchargement
      toast.success("La facture a été téléchargée avec succès");
      
      // En production, traitement du blob pour le téléchargement
      /*
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      */
    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture:", error);
      toast.error("Impossible de télécharger la facture");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Pagination
  const indexOfLastFacture = currentPage * facturesPerPage;
  const indexOfFirstFacture = indexOfLastFacture - facturesPerPage;
  const currentFactures = filteredFactures.slice(indexOfFirstFacture, indexOfLastFacture);
  const totalPages = Math.ceil(filteredFactures.length / facturesPerPage);

  // Formater un montant en euros
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Mes factures</h1>
      
      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une facture..."
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredFactures.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FaFilePdf className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-500">Aucune facture ne correspond à votre recherche</p>
        </div>
      ) : (
        <>
          {/* Liste des factures */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prestations
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFactures.map(facture => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFilePdf className="text-red-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{facture.numero}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">
                          {new Date(facture.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{facture.prestations_count} prestations</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatMontant(facture.montant_total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        facture.status === 'payee' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {facture.status === 'payee' ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownload(facture.id)}
                        className="text-purple-600 hover:text-purple-800 flex items-center justify-end"
                        disabled={downloadingInvoice === facture.id}
                      >
                        {downloadingInvoice === facture.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mr-2"></div>
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            <FaDownload className="mr-1" />
                            Télécharger
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{indexOfFirstFacture + 1}</span> à{' '}
                      <span className="font-medium">
                        {indexOfLastFacture > filteredFactures.length ? filteredFactures.length : indexOfLastFacture}
                      </span>{' '}
                      sur <span className="font-medium">{filteredFactures.length}</span> factures
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Précédent</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Suivant</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Informations supplémentaires */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations sur la facturation</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Les factures sont générées automatiquement à la fin de chaque mois pour toutes les prestations effectuées.</li>
              <li>Le paiement est effectué par virement bancaire dans un délai de 7 jours ouvrés après la date d'émission de la facture.</li>
              <li>Vous pouvez télécharger vos factures au format PDF pour les consulter ou les imprimer à tout moment.</li>
              <li>Pour toute question concernant vos factures ou paiements, veuillez contacter notre service comptabilité à <strong>comptabilite@ecodeli.fr</strong>.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PrestataireFactures;
