import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LivreurService from '../../api/livreur.service';
import { toast } from 'react-toastify';

const LivreurDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    completedDeliveries: 0,
    pendingDeliveries: 0,
    earnings: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Utiliser notre service API pour récupérer les données du dashboard
        const response = await LivreurService.getDashboard();
        
        if (response.data && response.data.success) {
          const dashboardData = response.data.data || {};
          
          setStats({
            completedDeliveries: dashboardData.completed_deliveries || 0,
            pendingDeliveries: dashboardData.pending_deliveries || 0,
            earnings: dashboardData.earnings || 0,
          });
          
          setRecentActivities(dashboardData.recent_activities || []);
        } else {
          // Utiliser des données fictives en cas d'échec ou si l'API n'est pas encore prête
          setStats({
            completedDeliveries: 12,
            pendingDeliveries: 3,
            earnings: 275.50,
          });
          
          setRecentActivities([
            { id: 1, type: 'livraison', status: 'completed', date: '2025-06-20', description: 'Livraison #12458 - Paris à Lyon' },
            { id: 2, type: 'livraison', status: 'in_progress', date: '2025-06-24', description: 'Livraison #12473 - Marseille à Nice' },
          ]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
        toast.error("Impossible de charger les données du tableau de bord");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-600 mb-6">Tableau de bord Livreur</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Livraisons terminées</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Livraisons en attente</h3>
              <p className="text-3xl font-bold text-yellow-500">{stats.pendingDeliveries}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Gains totaux</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.earnings.toFixed(2)} €</p>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/livreur/annonces" className="bg-green-600 text-white text-center py-4 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Voir annonces disponibles
              </Link>
              <Link to="/livreur/livraisons" className="bg-blue-600 text-white text-center py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Voir mes livraisons
              </Link>
              <Link to="/livreur/profil" className="bg-purple-600 text-white text-center py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Gérer mon profil
              </Link>
            </div>
          </div>
          
          {/* Activités récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Activités récentes</h2>
            {recentActivities.length > 0 ? (
              <div className="divide-y">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="py-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.description}</span>
                      <span className="text-gray-500">{activity.date}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status === 'completed' ? 'Terminé' :
                         activity.status === 'in_progress' ? 'En cours' :
                         activity.status === 'processed' ? 'Traité' : activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune activité récente</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LivreurDashboard;
