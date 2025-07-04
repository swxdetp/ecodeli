<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\ApiResponder;

class DisponibiliteController extends Controller
{
    use ApiResponder;
    
    /**
     * Display a listing of the disponibilités.
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $mois = $request->query('mois', date('m'));
            $annee = $request->query('annee', date('Y'));
            
            // Récupérer les disponibilités du prestataire pour le mois et l'année spécifiés
            $disponibilites = DB::table('disponibilites')
                ->where('prestataire_id', $user->id)
                ->whereMonth('date', $mois)
                ->whereYear('date', $annee)
                ->orderBy('date')
                ->get();
                
            // Si aucune disponibilité n'est trouvée, initialiser un tableau vide
            if ($disponibilites->isEmpty()) {
                $disponibilites = [];
            }
            
            return $this->successResponse(
                [
                    'disponibilites' => $disponibilites,
                    'mois' => (int)$mois,
                    'annee' => (int)$annee
                ],
                'Disponibilités récupérées avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des disponibilités: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Store a newly created disponibilité in storage.
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Valider les données
            $validated = $request->validate([
                'disponibilites' => 'required|array',
                'disponibilites.*.date' => 'required|date_format:Y-m-d',
                'disponibilites.*.matin' => 'required|boolean',
                'disponibilites.*.apres_midi' => 'required|boolean',
                'disponibilites.*.soir' => 'required|boolean'
            ]);
            
            // D'abord, supprimer les anciennes disponibilités pour les dates concernées
            $dates = array_map(function($item) {
                return $item['date'];
            }, $validated['disponibilites']);
            
            DB::table('disponibilites')
                ->where('prestataire_id', $user->id)
                ->whereIn('date', $dates)
                ->delete();
            
            // Ensuite, insérer les nouvelles disponibilités
            $now = now();
            $data = [];
            
            foreach ($validated['disponibilites'] as $disponibilite) {
                $data[] = [
                    'prestataire_id' => $user->id,
                    'date' => $disponibilite['date'],
                    'matin' => $disponibilite['matin'],
                    'apres_midi' => $disponibilite['apres_midi'],
                    'soir' => $disponibilite['soir'],
                    'created_at' => $now,
                    'updated_at' => $now
                ];
            }
            
            DB::table('disponibilites')->insert($data);
            
            return $this->successResponse(
                ['disponibilites' => $data],
                'Disponibilités enregistrées avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de l\'enregistrement des disponibilités: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Display the specified disponibilité.
     */
    public function show(string $id)
    {
        try {
            $user = Auth::user();
            
            $disponibilite = DB::table('disponibilites')
                ->where('id', $id)
                ->where('prestataire_id', $user->id)
                ->first();
                
            if (!$disponibilite) {
                return $this->errorResponse(
                    'Disponibilité non trouvée ou accès non autorisé',
                    404
                );
            }
            
            return $this->successResponse(
                $disponibilite,
                'Disponibilité récupérée avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de la disponibilité: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Update the specified disponibilité in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = Auth::user();
            
            // Vérifier que la disponibilité existe et appartient au prestataire
            $disponibilite = DB::table('disponibilites')
                ->where('id', $id)
                ->where('prestataire_id', $user->id)
                ->first();
                
            if (!$disponibilite) {
                return $this->errorResponse(
                    'Disponibilité non trouvée ou accès non autorisé',
                    404
                );
            }
            
            // Valider les données
            $validated = $request->validate([
                'matin' => 'sometimes|boolean',
                'apres_midi' => 'sometimes|boolean',
                'soir' => 'sometimes|boolean'
            ]);
            
            // Mettre à jour la disponibilité
            DB::table('disponibilites')
                ->where('id', $id)
                ->update([
                    'matin' => $validated['matin'] ?? $disponibilite->matin,
                    'apres_midi' => $validated['apres_midi'] ?? $disponibilite->apres_midi,
                    'soir' => $validated['soir'] ?? $disponibilite->soir,
                    'updated_at' => now()
                ]);
                
            // Récupérer la disponibilité mise à jour
            $updatedDisponibilite = DB::table('disponibilites')
                ->where('id', $id)
                ->first();
                
            return $this->successResponse(
                $updatedDisponibilite,
                'Disponibilité mise à jour avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la mise à jour de la disponibilité: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Remove the specified disponibilité from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = Auth::user();
            
            // Vérifier que la disponibilité existe et appartient au prestataire
            $disponibilite = DB::table('disponibilites')
                ->where('id', $id)
                ->where('prestataire_id', $user->id)
                ->first();
                
            if (!$disponibilite) {
                return $this->errorResponse(
                    'Disponibilité non trouvée ou accès non autorisé',
                    404
                );
            }
            
            // Vérifier si la disponibilité est liée à des prestations
            $prestationsLiees = DB::table('prestations')
                ->where('prestataire_id', $user->id)
                ->where('date', $disponibilite->date)
                ->whereIn('status', ['accepted', 'in_progress'])
                ->count();
                
            if ($prestationsLiees > 0) {
                return $this->errorResponse(
                    'Impossible de supprimer cette disponibilité car elle est liée à des prestations acceptées ou en cours',
                    400
                );
            }
            
            // Supprimer la disponibilité
            DB::table('disponibilites')
                ->where('id', $id)
                ->delete();
                
            return $this->successResponse(
                null,
                'Disponibilité supprimée avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la suppression de la disponibilité: ' . $e->getMessage(),
                500
            );
        }
    }
}
