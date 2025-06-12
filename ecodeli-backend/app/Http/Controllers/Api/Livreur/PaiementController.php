<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use App\Models\Livraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaiementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->paiements();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $paiements = $query->with('payable')->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des paiements récupérée avec succès',
            'data' => $paiements
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Paiement $paiement)
    {
        // Vérifier que le paiement appartient au livreur connecté
        if ($paiement->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à ce paiement',
                'data' => null
            ], 403);
        }
        
        $paiement->load('payable', 'facture');
        
        return response()->json([
            'success' => true,
            'message' => 'Détails du paiement récupérés avec succès',
            'data' => $paiement
        ]);
    }

    /**
     * Récupérer le résumé des paiements.
     */
    public function summary()
    {
        $user = Auth::user();
        
        // Calculer le montant total des paiements
        $totalPaiements = $user->paiements()
            ->where('status', 'completed')
            ->sum('amount');
            
        // Calculer le montant des paiements en attente
        $pendingPaiements = $user->paiements()
            ->where('status', 'pending')
            ->sum('amount');
            
        // Récupérer les paiements récents
        $recentPaiements = $user->paiements()
            ->with('payable')
            ->latest()
            ->take(5)
            ->get();
            
        // Calculer les statistiques mensuelles
        $monthlyStats = $user->paiements()
            ->where('status', 'completed')
            ->selectRaw('MONTH(transaction_date) as month, YEAR(transaction_date) as year, SUM(amount) as total')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(6)
            ->get();
            
        return response()->json([
            'success' => true,
            'message' => 'Résumé des paiements récupéré avec succès',
            'data' => [
                'total_paiements' => $totalPaiements,
                'pending_paiements' => $pendingPaiements,
                'recent_paiements' => $recentPaiements,
                'monthly_stats' => $monthlyStats
            ]
        ]);
    }

    /**
     * Demander un paiement pour une livraison terminée.
     */
    public function requestPayment(Request $request)
    {
        $validated = $request->validate([
            'livraison_id' => 'required|exists:livraisons,id',
        ]);
        
        $livraison = Livraison::findOrFail($validated['livraison_id']);
        
        // Vérifier que la livraison appartient au livreur connecté
        if ($livraison->livreur_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette livraison',
                'data' => null
            ], 403);
        }
        
        // Vérifier que la livraison est terminée
        if ($livraison->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de demander un paiement pour une livraison non terminée',
                'data' => null
            ], 400);
        }
        
        // Vérifier qu'un paiement n'existe pas déjà
        if ($livraison->paiements()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Un paiement existe déjà pour cette livraison',
                'data' => null
            ], 400);
        }
        
        // Créer le paiement
        $paiement = new Paiement([
            'user_id' => Auth::id(),
            'amount' => $livraison->annonce->price,
            'status' => 'pending',
            'transaction_date' => now(),
            'notes' => 'Paiement pour livraison #' . $livraison->id,
        ]);
        
        $livraison->paiements()->save($paiement);
        
        return response()->json([
            'success' => true,
            'message' => 'Demande de paiement créée avec succès',
            'data' => $paiement
        ], 201);
    }
}
