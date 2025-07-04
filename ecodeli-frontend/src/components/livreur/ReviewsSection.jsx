import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaSpinner } from 'react-icons/fa';
import ReviewService from '../../api/review.service';
import AuthService from '../../api/auth.service';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    if (user && user.id) {
      loadReviewData(user.id);
    }
  }, []);

  const loadReviewData = async (livreurId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Charger les avis et les statistiques en parallèle
      const [reviewsResponse, statsResponse] = await Promise.all([
        ReviewService.getLivreurReviews(livreurId),
        ReviewService.getLivreurReviewStats(livreurId)
      ]);
      
      if (reviewsResponse.data.success && statsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews);
        setStats(statsResponse.data.data);
      } else {
        setError('Erreur lors du chargement des avis.');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      setError('Impossible de charger les avis. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu des étoiles pour la note moyenne
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    
    return stars;
  };

  // Rendu des barres de progression pour la distribution des notes
  const renderRatingBar = (count, totalReviews) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-yellow-400 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-green-500 mr-2" />
        <span>Chargement des avis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span>Avis clients</span>
        {stats && stats.total_reviews > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            ({stats.total_reviews} avis)
          </span>
        )}
      </h2>

      {stats && stats.total_reviews > 0 ? (
        <>
          {/* Affichage des statistiques */}
          <div className="flex flex-col md:flex-row border-b pb-4 mb-4">
            <div className="md:w-1/3 flex flex-col items-center justify-center mb-4 md:mb-0">
              <div className="text-4xl font-bold text-green-600">
                {stats.average_rating}
              </div>
              <div className="flex items-center my-2">
                {renderStars(stats.average_rating)}
              </div>
              <div className="text-sm text-gray-600">
                {stats.total_reviews} avis
              </div>
            </div>
            
            <div className="md:w-2/3">
              {/* Distribution des notes (5 étoiles à 1 étoile) */}
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center mb-2">
                  <div className="w-8 text-sm font-medium">{star}</div>
                  <FaStar className="text-yellow-400 mr-2" />
                  <div className="flex-1 mx-2">
                    {renderRatingBar(stats.rating_distribution[star], stats.total_reviews)}
                  </div>
                  <div className="w-8 text-right text-sm text-gray-600">
                    {stats.rating_distribution[star]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Liste des avis */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center mb-1">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {review.client_name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {review.date}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">Aucun avis pour le moment.</p>
          <p className="text-sm text-gray-400 mt-1">
            Les avis s'afficheront ici lorsque des clients évalueront vos livraisons via NFC.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
