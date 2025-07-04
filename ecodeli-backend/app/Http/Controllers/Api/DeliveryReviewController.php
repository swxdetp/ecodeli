<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryReview;
use App\Models\Livraison;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DeliveryReviewController extends Controller
{
    /**
     * Créer un avis suite à un scan NFC.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function createReview(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'livraison_id' => 'required|exists:livraisons,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'nfc_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer la livraison
            $livraison = Livraison::findOrFail($request->livraison_id);
            
            // Vérifier que la livraison a bien le statut "delivered" ou équivalent
            if ($livraison->status !== 'delivered' && $livraison->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette livraison n\'est pas encore terminée',
                ], 400);
            }
            
            // Vérifier si un avis existe déjà pour cette livraison
            $existingReview = DeliveryReview::where('livraison_id', $livraison->id)->first();
            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un avis a déjà été donné pour cette livraison',
                ], 400);
            }
            
            // Créer un identifiant de session NFC unique pour éviter les duplications
            $nfcSessionId = Str::uuid();
            
            // Créer l'avis
            $review = DeliveryReview::create([
                'livraison_id' => $livraison->id,
                'livreur_id' => $livraison->livreur_id,
                'client_id' => $livraison->client_id ?? null,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'nfc_session_id' => $nfcSessionId,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Avis enregistré avec succès',
                'data' => $review
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de l\'avis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'enregistrement de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les avis pour un livreur spécifique.
     *
     * @param  int  $livreurId
     * @return \Illuminate\Http\Response
     */
    public function getLivreurReviews($livreurId)
    {
        try {
            // Vérifier que l'utilisateur est bien un livreur
            $livreur = User::where('id', $livreurId)
                           ->where('role', 'livreur')
                           ->firstOrFail();
            
            // Récupérer tous les avis pour ce livreur, du plus récent au plus ancien
            $reviews = DeliveryReview::where('livreur_id', $livreurId)
                                    ->orderBy('created_at', 'desc')
                                    ->get()
                                    ->map(function($review) {
                                        // Formatage des données pour le frontend
                                        return [
                                            'id' => $review->id,
                                            'rating' => $review->rating,
                                            'comment' => $review->comment,
                                            'date' => $review->created_at->format('Y-m-d H:i'),
                                            'client_name' => $review->client ? $review->client->name : 'Client anonyme',
                                            'livraison_id' => $review->livraison_id
                                        ];
                                    });
            
            // Calculer la note moyenne
            $averageRating = 0;
            if (count($reviews) > 0) {
                $averageRating = $reviews->avg('rating');
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Liste des avis récupérée avec succès',
                'data' => [
                    'reviews' => $reviews,
                    'average_rating' => round($averageRating, 1),
                    'total_reviews' => count($reviews)
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des avis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les statistiques d'avis pour un livreur.
     *
     * @param  int  $livreurId
     * @return \Illuminate\Http\Response
     */
    public function getLivreurReviewStats($livreurId)
    {
        try {
            // Vérifier que l'utilisateur est bien un livreur
            $livreur = User::where('id', $livreurId)
                           ->where('role', 'livreur')
                           ->firstOrFail();
            
            // Récupérer les statistiques d'avis
            $totalReviews = DeliveryReview::where('livreur_id', $livreurId)->count();
            
            if ($totalReviews === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Aucun avis trouvé pour ce livreur',
                    'data' => [
                        'average_rating' => 0,
                        'total_reviews' => 0,
                        'rating_distribution' => [
                            5 => 0,
                            4 => 0,
                            3 => 0,
                            2 => 0,
                            1 => 0
                        ]
                    ]
                ]);
            }
            
            // Calculer la note moyenne
            $averageRating = DeliveryReview::where('livreur_id', $livreurId)
                                          ->avg('rating');
            
            // Récupérer la distribution des notes
            $ratingDistribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $ratingDistribution[$i] = DeliveryReview::where('livreur_id', $livreurId)
                                                      ->where('rating', $i)
                                                      ->count();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Statistiques récupérées avec succès',
                'data' => [
                    'average_rating' => round($averageRating, 1),
                    'total_reviews' => $totalReviews,
                    'rating_distribution' => $ratingDistribution
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des statistiques d\'avis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des statistiques d\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
