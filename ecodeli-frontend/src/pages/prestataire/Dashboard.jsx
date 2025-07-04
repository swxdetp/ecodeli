import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaClipboardList, FaUser, FaFileInvoiceDollar, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import PrestataireService from '../../api/prestataire.service';

const PrestataireDashboard = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    prestations_en_cours: 0,
    prestations_terminees: 0,
    revenus_mois: 0,
    revenus_total: 0,
    note_moyenne: 0,
    prestations_recentes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getDashboard();
        
        // Pour le développement, utiliser les données mock
        const response = await PrestataireService.mockData.getDashboard();
        
        if (response.data && response.data.success) {
          setDashboardData(response.data.data || {});
        } else {
          toast.error("Erreur lors de la récupération des données du tableau de bord");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
        toast.error("Impossible de charger les données du tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formater un montant en euros
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Traduire le statut en français et obtenir la classe CSS
  const getStatusInfo = (status) => {
    switch (status) {
      case 'en_cours':
        return { label: 'En cours', className: 'bg-blue-100 text-blue-800' };
      case 'terminee':
        return { label: 'Terminée', className: 'bg-green-100 text-green-800' };
      case 'a_venir':
        return { label: 'À venir', className: 'bg-purple-100 text-purple-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Tableau de bord Prestataire</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-purple-100 p-3 mr-3">
                  <FaClipboardList className="text-purple-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Prestations en cours</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.prestations_en_cours}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-green-100 p-3 mr-3">
                  <FaCalendarCheck className="text-green-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Prestations terminées</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">{dashboardData.prestations_terminees}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-blue-100 p-3 mr-3">
                  <FaFileInvoiceDollar className="text-blue-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Revenus du mois</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{formatMontant(dashboardData.revenus_mois)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-yellow-100 p-3 mr-3">
                  <FaStar className="text-yellow-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Note moyenne</h3>
              </div>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-yellow-600 mr-2">{dashboardData.note_moyenne?.toFixed(1) || "N/A"}</p>
                {dashboardData.note_moyenne && (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < Math.round(dashboardData.note_moyenne) ? "text-yellow-400" : "text-gray-300"} 
                        size={16} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link to="/prestataire/prestations" className="bg-purple-600 text-white text-center py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Gérer mes prestations
              </Link>
              <Link to="/prestataire/disponibilites" className="bg-blue-600 text-white text-center py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Mon calendrier
              </Link>
              <Link to="/prestataire/factures" className="bg-green-600 text-white text-center py-4 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Mes factures
              </Link>
              <Link to="/prestataire/profil" className="bg-indigo-600 text-white text-center py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                Mon profil
              </Link>
            </div>
          </div>
          
          {/* Prestations récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Prestations récentes</h2>
            
            {dashboardData.prestations_recentes && dashboardData.prestations_recentes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.prestations_recentes.map(prestation => {
                      const statusInfo = getStatusInfo(prestation.status);
                      
                      return (
                        <tr key={prestation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(prestation.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {prestation.type.charAt(0).toUpperCase() + prestation.type.slice(1).replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {prestation.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {prestation.client}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucune prestation récente</p>
            )}
            
            <div className="mt-4">
              <Link 
                to="/prestataire/prestations" 
                className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
              >
                Voir toutes mes prestations
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrestataireDashboard;
