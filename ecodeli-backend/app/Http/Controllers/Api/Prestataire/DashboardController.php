<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Prestation;
use App\Models\Facture;
use App\Traits\ApiResponder;

class DashboardController extends Controller
{
    use ApiResponder;
    /**
     * Display dashboard data for prestataire.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $now = now();
            
            // Récupérer les statistiques générales
            $stats = [
                'prestations' => [
                    'total' => $user->prestations()->count(),
                    'pending' => $user->prestations()->where('status', 'pending')->count(),
                    'accepted' => $user->prestations()->where('status', 'accepted')->count(),
                    'completed' => $user->prestations()->where('status', 'completed')->count(),
                    'rejected' => $user->prestations()->where('status', 'rejected')->count(),
                    'canceled' => $user->prestations()->where('status', 'canceled')->count(),
                ],
                'factures' => [
                    'total' => $user->factures()->count(),
                    'pending' => $user->factures()->where('status', 'pending')->count(),
                    'paid' => $user->factures()->where('status', 'paid')->count(),
                    'overdue' => $user->factures()
                        ->where('status', 'pending')
                        ->where('date_echeance', '<', $now)
                        ->count(),
                    'montant_total' => $user->factures()->sum('montant_ttc'),
                    'montant_paye' => $user->factures()->where('status', 'paid')->sum('montant_ttc'),
                ],
                'evaluations' => [
                    'total' => $user->evaluations()->count(),
                    'note_moyenne' => $user->evaluations()->avg('note') ?? 0,
                ],
            ];
            
            // Récupérer les prestations récentes
            $prestationsRecentes = $user->prestations()
                ->with('client:id,nom,prenom,email')
                ->with('typePrestation:id,nom,description')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get([
                    'id', 'titre', 'description', 'prix', 'status', 'date', 'created_at',
                    'client_id', 'type_prestation_id'
                ]);
            
            // Récupérer les factures récentes
            $facturesRecentes = $user->factures()
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get([
                    'id', 'numero', 'montant_ht', 'montant_ttc', 'status', 'date_emission', 'date_echeance'
                ]);
            
            // Récupérer les évaluations récentes
            $evaluationsRecentes = $user->evaluations()
                ->with('client:id,nom,prenom')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get([
                    'id', 'note', 'commentaire', 'created_at', 'client_id'
                ]);
            
            // Récupérer les disponibilités prochaines
            $disponibilitesProchaines = DB::table('disponibilites')
                ->where('prestataire_id', $user->id)
                ->where('date', '>=', $now->format('Y-m-d'))
                ->orderBy('date')
                ->take(10)
                ->get();
            
            // Récupérer les prestations à venir (planifiées)
            $prestationsAVenir = $user->prestations()
                ->with('client:id,nom,prenom,email')
                ->with('typePrestation:id,nom,description')
                ->whereIn('status', ['accepted'])
                ->where('date', '>=', $now->format('Y-m-d'))
                ->orderBy('date')
                ->get([
                    'id', 'titre', 'description', 'prix', 'status', 'date', 'heure_debut',
                    'client_id', 'type_prestation_id'
                ]);
            
            return $this->successResponse(
                [
                    'stats' => $stats,
                    'prestations_recentes' => $prestationsRecentes,
                    'factures_recentes' => $facturesRecentes,
                    'evaluations_recentes' => $evaluationsRecentes,
                    'disponibilites_prochaines' => $disponibilitesProchaines,
                    'prestations_a_venir' => $prestationsAVenir,
                    'user' => $user->only('id', 'nom', 'prenom', 'email', 'photo_url'),
                ],
                'Données du tableau de bord prestataire récupérées avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des données du tableau de bord: ' . $e->getMessage(),
                500
            );
        }
    }
}
