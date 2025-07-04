import React, { useState, useEffect } from 'react';
import { FaStar, FaFilter, FaSort, FaRegCommentDots, FaCalendarAlt } from 'react-icons/fa';
import PrestataireService from '../../api/prestataire.service';

/**
 * Composant d'affichage d'étoiles pour les évaluations
 */
const StarRating = ({ rating, size = 'sm' }) => {
  const stars = [];
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <FaStar 
        key={i} 
        className={`${i <= rating ? 'text-yellow-400' : 'text-gray-300'} ${sizeClass}`} 
      />
    );
  }
  
  return <div className="flex items-center">{stars}</div>;
};

/**
 * Carte d'évaluation pour afficher un avis client
 */
const EvaluationCard = ({ evaluation }) => {
  const formattedDate = new Date(evaluation.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-purple-500">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="font-semibold text-gray-800">{evaluation.client_name}</span>
          <div className="flex items-center mt-1">
            <StarRating rating={evaluation.rating} />
            <span className="ml-2 text-gray-700 text-sm">{evaluation.rating}/5</span>
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <FaCalendarAlt className="mr-1" />
          {formattedDate}
        </div>
      </div>
      
      <div className="mb-3 text-gray-600">
        {evaluation.comment}
      </div>
      
      <div className="flex items-center text-sm">
        <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs font-medium">
          {evaluation.service_type}
        </span>
        <span className="ml-3 text-gray-500">
          Intervention #{evaluation.intervention_id}
        </span>
      </div>
      
      {evaluation.response && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center mb-2">
            <FaRegCommentDots className="text-green-600 mr-2" />
            <span className="font-medium text-green-600">Votre réponse :</span>
          </div>
          <p className="text-gray-600 text-sm">{evaluation.response}</p>
        </div>
      )}
      
      {!evaluation.response && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium focus:outline-none">
            Répondre à cet avis
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Page principale des évaluations prestataire
 */
const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, responded, not_responded
  const [sort, setSort] = useState('date'); // date, rating
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setIsLoading(true);
        
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getEvaluations();
        // setEvaluations(response.data.evaluations);
        // setStats(response.data.stats);
        
        // Pour le développement, utilisation de données fictives
        setTimeout(() => {
          const mockEvaluations = PrestataireService.getMockEvaluations();
          setEvaluations(mockEvaluations.evaluations);
          setStats(mockEvaluations.stats);
          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error("Erreur lors du chargement des évaluations:", error);
        setIsLoading(false);
      }
    };
    
    fetchEvaluations();
  }, []);
  
  // Filtrer les évaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filter === 'all') return true;
    if (filter === 'responded') return !!evaluation.response;
    if (filter === 'not_responded') return !evaluation.response;
    return true;
  });
  
  // Trier les évaluations
  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    if (sort === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sort === 'rating') {
      return b.rating - a.rating || new Date(b.date) - new Date(a.date);
    }
    return 0;
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Mes évaluations</h1>
      
      {/* Statistiques */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Résumé de vos évaluations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Note moyenne */}
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.average.toFixed(1)}</div>
            <div className="mb-2">
              <StarRating rating={stats.average} size="lg" />
            </div>
            <div className="text-gray-600 text-sm">{stats.total} évaluation{stats.total > 1 ? 's' : ''}</div>
          </div>
          
          {/* Distribution */}
          <div className="md:col-span-2">
            {[5, 4, 3, 2, 1].map(star => {
              const percentage = stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center mb-2">
                  <div className="flex items-center w-20">
                    <span className="text-sm text-gray-600 mr-2">{star}</span>
                    <FaStar className="text-yellow-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2.5 w-full">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">{stats.distribution[star]} ({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Filtres et tri */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <span className="text-gray-700 mr-2">Filtrer :</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toutes les évaluations</option>
            <option value="responded">Avec réponse</option>
            <option value="not_responded">Sans réponse</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <FaSort className="text-gray-500 mr-2" />
          <span className="text-gray-700 mr-2">Trier par :</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">Date (plus récentes)</option>
            <option value="rating">Note (plus élevées)</option>
          </select>
        </div>
      </div>
      
      {/* Liste des évaluations */}
      {sortedEvaluations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">
            <FaRegCommentDots className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune évaluation pour le moment
          </h3>
          <p className="text-gray-500 mb-4">
            Vous n'avez pas encore reçu d'évaluations de vos clients.
          </p>
          <p className="text-gray-600">
            Les évaluations apparaîtront ici après que vos clients aient noté vos services.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvaluations.map((evaluation) => (
            <EvaluationCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluations;
