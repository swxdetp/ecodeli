<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnnonceController extends Controller
{
    use ApiResponder;

    /**
     * Liste des annonces disponibles (non acceptées)
     */
    public function index(Request $request)
    {
        // Débogage - vérifier s'il y a des annonces en base
        $total = Annonce::count();
        \Illuminate\Support\Facades\Log::debug('Nombre total d\'annonces en base: ' . $total);
        
        // Récupérer toutes les annonces qui pourraient être disponibles
        // Ne filtrer QUE sur les annonces qui n'ont pas de livreur assigné
        $annonces = Annonce::whereNull('livreur_id')
            // Accepter tous les status sauf 'canceled' et 'completed'
            ->whereNotIn('status', ['canceled', 'completed'])
            ->with('user:id,name,email,phone')
            ->latest()
            ->limit(50)
            ->get();
        
        // Débogage - vérifier les annonces récupérées
        \Illuminate\Support\Facades\Log::debug('Nombre d\'annonces disponibles récupérées: ' . count($annonces));
        
        // Réponse simplifiée au format attendu par le frontend
        return response()->json([
            'success' => true,
            'message' => 'Liste des annonces disponibles récupérée avec succès',
            'data' => $annonces,
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 50,
            'total' => count($annonces)
        ]);
    }

    /**
     * Accepter une annonce
     */
    public function accepter($id)
    {
        try {
            // Vérifier explicitement l'authentification
            if (!Auth::check()) {
                \Illuminate\Support\Facades\Log::error('Utilisateur non authentifié - AccepterAnnonce');
                return $this->errorResponse('Vous devez être connecté pour accepter une annonce', 401);
            }
            
            // Détail de l'authentification
            $user = Auth::user();
            \Illuminate\Support\Facades\Log::debug('Détails authentification', [
                'auth_check' => Auth::check(),
                'user_id' => $user ? $user->id : 'null',
                'user_email' => $user ? $user->email : 'null',
                'user_role' => $user ? $user->role : 'null'
            ]);
            
            // Récupérer l'ID du livreur authentifié
            $livreurId = $user ? $user->id : null;
            
            if (!$livreurId) {
                \Illuminate\Support\Facades\Log::error('Impossible d\'obtenir l\'ID du livreur authentifié');
                return $this->errorResponse('Authentification invalide - Impossible de déterminer l\'identifiant du livreur', 401);
            }
            
            DB::beginTransaction();
            
            $annonce = Annonce::findOrFail($id);
            
            // Vérifier que l'annonce n'est pas déjà prise
            if ($annonce->livreur_id !== null) {
                return $this->errorResponse('Cette annonce a déjà été prise par un autre livreur', 400);
            }
            
            // Log de débogage
            \Illuminate\Support\Facades\Log::debug('Début acceptation annonce - ID annonce: ' . $id . ', ID livreur: ' . $livreurId);
            
            // Accepter l'annonce
            $annonce->livreur_id = $livreurId;
            $annonce->status = 'accepted';
            $annonce->save();
            
            // Créer la livraison avec tous les champs obligatoires explicitement définis
            // En utilisant le modèle Livraison directement
            $livraison = new \App\Models\Livraison();
            $livraison->annonce_id = $annonce->id;
            $livraison->livreur_id = $livreurId; // Utilisation de l'ID vérifié
            $livraison->status = 'accepted';
            
            // Log des données de livraison avant sauvegarde
            \Illuminate\Support\Facades\Log::debug('Données livraison avant sauvegarde: ', [
                'annonce_id' => $livraison->annonce_id,
                'livreur_id' => $livraison->livreur_id,
                'status' => $livraison->status
            ]);
            
            // Sauvegarde explicite de la livraison
            $livraison->save();
            
            \Illuminate\Support\Facades\Log::debug('Livraison créée avec succès - ID: ' . $livraison->id);
            
            DB::commit();
            
            return $this->successResponse($annonce->load('user'), 'Annonce acceptée avec succès');
            
        } catch (\Exception $e) {
            if (isset($DB) && DB::transactionLevel() > 0) {
                DB::rollback();
            }
            \Illuminate\Support\Facades\Log::error('Exception lors de l\'acceptation d\'annonce: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return $this->errorResponse('Erreur lors de l\'acceptation de l\'annonce: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Refuser une annonce
     */
    public function refuser($id)
    {
        try {
            $annonce = Annonce::findOrFail($id);
            
            // On pourrait stocker les refus dans une table pivot si nécessaire
            // Pour l'instant, on renvoie simplement un succès
            
            return $this->successResponse(null, 'Annonce refusée');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors du refus de l\'annonce: ' . $e->getMessage(), 500);
        }
    }
}
