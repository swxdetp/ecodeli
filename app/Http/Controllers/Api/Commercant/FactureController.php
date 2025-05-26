<?php

namespace App\Http\Controllers\Api\Commercant;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->factures();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $factures = $query->with('facturable')->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des factures récupérée avec succès',
            'data' => $factures
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Facture $facture)
    {
        // Vérifier que la facture appartient au commerçant connecté
        if ($facture->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette facture',
                'data' => null
            ], 403);
        }
        
        $facture->load('facturable', 'paiement');
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de la facture récupérés avec succès',
            'data' => $facture
        ]);
    }

    /**
     * Download the PDF of the invoice.
     */
    public function download(Facture $facture)
    {
        // Vérifier que la facture appartient au commerçant connecté
        if ($facture->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette facture',
                'data' => null
            ], 403);
        }
        
        if (!$facture->pdf_path || !Storage::exists($facture->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Le PDF de cette facture n\'existe pas',
                'data' => null
            ], 404);
        }
        
        return Storage::download($facture->pdf_path, 'facture-' . $facture->numero . '.pdf');
    }
    
    /**
     * Pay an invoice.
     */
    public function pay(Request $request, Facture $facture)
    {
        // Vérifier que la facture appartient au commerçant connecté
        if ($facture->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette facture',
                'data' => null
            ], 403);
        }
        
        // Vérifier que la facture n'est pas déjà payée
        if ($facture->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cette facture est déjà payée',
                'data' => null
            ], 400);
        }
        
        $validated = $request->validate([
            'payment_method' => 'required|string|in:card,bank_transfer',
            'payment_details' => 'required|array',
        ]);
        
        // Ici, vous intégreriez un service de paiement comme Stripe
        // Pour l'exemple, nous allons simplement simuler le paiement
        
        // Créer un paiement
        $paiement = $facture->paiement()->create([
            'user_id' => Auth::id(),
            'amount' => $facture->montant_ttc,
            'status' => 'completed',
            'payment_method' => $validated['payment_method'],
            'payment_id' => 'sim_' . uniqid(),
            'transaction_date' => now(),
            'notes' => 'Paiement de la facture ' . $facture->numero,
        ]);
        
        // Mettre à jour le statut de la facture
        $facture->update([
            'status' => 'paid',
            'paiement_id' => $paiement->id,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Facture payée avec succès',
            'data' => [
                'facture' => $facture,
                'paiement' => $paiement
            ]
        ]);
    }
    
    /**
     * Get a summary of invoices.
     */
    public function summary()
    {
        $user = Auth::user();
        
        // Calculer le montant total des factures
        $totalFactures = $user->factures()->sum('montant_ttc');
        
        // Calculer le montant des factures payées
        $paidFactures = $user->factures()
            ->where('status', 'paid')
            ->sum('montant_ttc');
            
        // Calculer le montant des factures en attente
        $pendingFactures = $user->factures()
            ->where('status', 'pending')
            ->sum('montant_ttc');
            
        // Récupérer les factures récentes
        $recentFactures = $user->factures()
            ->with('facturable')
            ->latest()
            ->take(5)
            ->get();
            
        return response()->json([
            'success' => true,
            'message' => 'Résumé des factures récupéré avec succès',
            'data' => [
                'total_factures' => $totalFactures,
                'paid_factures' => $paidFactures,
                'pending_factures' => $pendingFactures,
                'recent_factures' => $recentFactures
            ]
        ]);
    }
}
