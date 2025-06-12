<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Paiement::query();
        
        // Filtrer par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filtrer par méthode de paiement
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        // Filtrer par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filtrer par date
        if ($request->has('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }
        
        // Filtrer par montant
        if ($request->has('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }
        
        if ($request->has('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }
        
        $paiements = $query->with(['user', 'payable'])->latest()->paginate(10);
        
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
        $paiement->load(['user', 'payable', 'facture']);
        
        return response()->json([
            'success' => true,
            'message' => 'Détails du paiement récupérés avec succès',
            'data' => $paiement
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Paiement $paiement)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'payment_method' => 'sometimes|string',
            'payment_id' => 'sometimes|string',
            'transaction_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $paiement->update($validated);

        // Si le statut est mis à jour, mettre à jour également le statut de la facture associée
        if (isset($validated['status']) && $paiement->facture) {
            if ($validated['status'] === 'completed') {
                $paiement->facture->update(['status' => 'paid']);
            } elseif ($validated['status'] === 'refunded') {
                $paiement->facture->update(['status' => 'canceled']);
            } elseif ($validated['status'] === 'pending' || $validated['status'] === 'failed') {
                $paiement->facture->update(['status' => 'pending']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Paiement mis à jour avec succès',
            'data' => $paiement
        ]);
    }

    /**
     * Process a pending payment.
     */
    public function process(Request $request, Paiement $paiement)
    {
        // Vérifier que le paiement est en attente
        if ($paiement->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les paiements en attente peuvent être traités',
                'data' => null
            ], 400);
        }
        
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string',
        ]);
        
        if ($validated['action'] === 'approve') {
            $paiement->update([
                'status' => 'completed',
                'transaction_date' => now(),
                'notes' => $validated['notes'] ?? $paiement->notes,
            ]);
            
            // Mettre à jour la facture associée si elle existe
            if ($paiement->facture) {
                $paiement->facture->update(['status' => 'paid']);
            }
            
            $message = 'Paiement approuvé avec succès';
        } else {
            $paiement->update([
                'status' => 'failed',
                'notes' => $validated['notes'] ?? $paiement->notes,
            ]);
            
            $message = 'Paiement rejeté avec succès';
        }
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paiement
        ]);
    }

    /**
     * Get statistics about payments.
     */
    public function statistics()
    {
        // Montant total des paiements par statut
        $totalByStatus = Paiement::selectRaw('status, SUM(amount) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();
            
        // Nombre de paiements par méthode
        $countByMethod = Paiement::selectRaw('payment_method, count(*) as count')
            ->groupBy('payment_method')
            ->get()
            ->pluck('count', 'payment_method')
            ->toArray();
            
        // Montant des paiements par mois
        $totalByMonth = Paiement::selectRaw('MONTH(transaction_date) as month, YEAR(transaction_date) as year, SUM(amount) as total')
            ->where('status', 'completed')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();
            
        // Utilisateurs avec le plus de paiements
        $topUsers = Paiement::selectRaw('user_id, SUM(amount) as total')
            ->where('status', 'completed')
            ->with('user:id,name,email,role')
            ->groupBy('user_id')
            ->orderBy('total', 'desc')
            ->take(5)
            ->get();
            
        return response()->json([
            'success' => true,
            'message' => 'Statistiques récupérées avec succès',
            'data' => [
                'total_by_status' => $totalByStatus,
                'count_by_method' => $countByMethod,
                'total_by_month' => $totalByMonth,
                'top_users' => $topUsers
            ]
        ]);
    }

    /**
     * Export payments data to CSV.
     */
    public function export(Request $request)
    {
        $query = Paiement::query();
        
        // Appliquer les mêmes filtres que pour l'index
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->has('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }
        
        $paiements = $query->with(['user', 'payable'])->get();
        
        // Préparer les données pour le CSV
        $csvData = [];
        $csvData[] = ['ID', 'Utilisateur', 'Montant', 'Statut', 'Méthode', 'Date', 'Type', 'Référence'];
        
        foreach ($paiements as $paiement) {
            $csvData[] = [
                $paiement->id,
                $paiement->user->name,
                $paiement->amount,
                $paiement->status,
                $paiement->payment_method,
                $paiement->transaction_date,
                $paiement->payable_type,
                $paiement->payable_id,
            ];
        }
        
        // Générer le CSV
        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="paiements.csv"',
        ];
        
        return response()->stream($callback, 200, $headers);
    }
}
