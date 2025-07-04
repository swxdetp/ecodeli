<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Livraison;
use App\Models\Annonce;
use Illuminate\Support\Facades\DB;

class LivraisonController extends Controller
{
    /**
     * Display a listing of the livraisons that need validation (status = delivered).
     */
    public function pendingDeliveries(Request $request)
    {
        try {
            $query = Livraison::with(['annonce', 'livreur', 'client'])
                ->where('status', 'delivered');
            
            $livraisons = $query->orderBy('created_at', 'desc')->get();
            
            // Transformer les données pour inclure les informations nécessaires
            $livraisons = $livraisons->map(function($livraison) {
                return [
                    'id' => $livraison->id,
                    'annonce' => $livraison->annonce ? [
                        'id' => $livraison->annonce->id,
                        'title' => $livraison->annonce->title,
                        'address_from' => $livraison->annonce->address_from,
                        'address_to' => $livraison->annonce->address_to,
                        'price' => $livraison->annonce->price,
                        'date_from' => $livraison->annonce->date_from,
                        'date_to' => $livraison->annonce->date_to,
                    ] : null,
                    'livreur' => $livraison->livreur ? [
                        'id' => $livraison->livreur->id,
                        'name' => $livraison->livreur->name,
                        'email' => $livraison->livreur->email,
                    ] : null,
                    'client' => $livraison->client ? [
                        'id' => $livraison->client->id,
                        'name' => $livraison->client->name,
                        'email' => $livraison->client->email,
                    ] : null,
                    'status' => $livraison->status,
                    'delivery_date' => $livraison->delivery_date,
                    'created_at' => $livraison->created_at,
                    'updated_at' => $livraison->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Liste des livraisons en attente de validation récupérée avec succès',
                'data' => $livraisons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des livraisons en attente de validation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Validate a delivery that was marked as delivered by the delivery person
     */
    public function validateDelivery(Request $request, Livraison $livraison)
    {
        try {
            // Vérifier que la livraison est bien en statut 'delivered'
            if ($livraison->status !== 'delivered') {
                return response()->json([
                    'success' => false,
                    'message' => 'La livraison ne peut pas être validée car elle n\'est pas en statut "livrée"',
                ], 400);
            }
            
            // Mettre à jour le statut de la livraison
            $livraison->status = 'completed';
            $livraison->save();
            
            // Marquer toutes les notifications associées comme lues
            \App\Models\AdminNotification::where('livraison_id', $livraison->id)->update(['read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'Livraison validée avec succès',
                'data' => $livraison
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation de la livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Refuse a delivery that was marked as delivered by the delivery person
     */
    public function refuseDelivery(Request $request, Livraison $livraison)
    {
        try {
            // Vérifier que la livraison est bien en statut 'delivered'
            if ($livraison->status !== 'delivered') {
                return response()->json([
                    'success' => false,
                    'message' => 'La livraison ne peut pas être refusée car elle n\'est pas en statut "livrée"',
                ], 400);
            }
            
            // Validation de la raison du refus
            $validated = $request->validate([
                'reason' => 'required|string|min:5',
            ]);
            
            // Mettre à jour le statut de la livraison et ajouter la raison du refus
            $livraison->status = 'in_progress'; // Remettre en cours pour que le livreur puisse réessayer
            $livraison->admin_notes = $validated['reason'];
            $livraison->save();
            
            // Marquer toutes les notifications associées comme lues
            \App\Models\AdminNotification::where('livraison_id', $livraison->id)->update(['read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'Livraison refusée avec succès',
                'data' => $livraison
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du refus de la livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display a listing of the livraisons.
     */
    public function index(Request $request)
    {
        try {
            $query = Livraison::with(['annonce', 'livreur', 'client']);
            
            // Filtrage par statut si paramètre présent
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $livraisons = $query->orderBy('created_at', 'desc')->get();
            
            // Transformer les données pour inclure les informations nécessaires
            $livraisons = $livraisons->map(function($livraison) {
                return [
                    'id' => $livraison->id,
                    'annonce' => $livraison->annonce ? [
                        'id' => $livraison->annonce->id,
                        'title' => $livraison->annonce->title,
                        'address_from' => $livraison->annonce->address_from,
                        'address_to' => $livraison->annonce->address_to,
                        'price' => $livraison->annonce->price,
                        'date_from' => $livraison->annonce->date_from,
                        'date_to' => $livraison->annonce->date_to,
                    ] : null,
                    'livreur' => $livraison->livreur ? [
                        'id' => $livraison->livreur->id,
                        'name' => $livraison->livreur->name,
                        'email' => $livraison->livreur->email,
                    ] : null,
                    'client' => $livraison->client ? [
                        'id' => $livraison->client->id,
                        'name' => $livraison->client->name,
                        'email' => $livraison->client->email,
                    ] : null,
                    'status' => $livraison->status,
                    'created_at' => $livraison->created_at,
                    'updated_at' => $livraison->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Liste des livraisons récupérée avec succès',
                'data' => $livraisons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des livraisons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created livraison in storage.
     */
    public function store(Request $request)
    {
        // À implémenter
    }

    /**
     * Display the specified livraison.
     */
    public function show(string $id)
    {
        try {
            $livraison = Livraison::with(['annonce', 'livreur', 'client'])->findOrFail($id);
            
            $data = [
                'id' => $livraison->id,
                'annonce' => $livraison->annonce ? [
                    'id' => $livraison->annonce->id,
                    'title' => $livraison->annonce->title,
                    'address_from' => $livraison->annonce->address_from,
                    'address_to' => $livraison->annonce->address_to,
                    'price' => $livraison->annonce->price,
                    'date_from' => $livraison->annonce->date_from,
                    'date_to' => $livraison->annonce->date_to,
                ] : null,
                'livreur' => $livraison->livreur ? [
                    'id' => $livraison->livreur->id,
                    'name' => $livraison->livreur->name,
                    'email' => $livraison->livreur->email,
                ] : null,
                'client' => $livraison->client ? [
                    'id' => $livraison->client->id,
                    'name' => $livraison->client->name,
                    'email' => $livraison->client->email,
                ] : null,
                'status' => $livraison->status,
                'created_at' => $livraison->created_at,
                'updated_at' => $livraison->updated_at,
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Détails de la livraison récupérés avec succès',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des détails de la livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified livraison in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $livraison = Livraison::findOrFail($id);
            
            // Valider les données
            $request->validate([
                'status' => 'sometimes|string|in:pending,in_progress,completed,cancelled',
                'livreur_id' => 'sometimes|exists:users,id',
                // autres champs si nécessaire
            ]);
            
            // Mettre à jour les champs autorisés
            if ($request->has('status')) {
                $livraison->status = $request->status;
            }
            
            if ($request->has('livreur_id')) {
                $livraison->livreur_id = $request->livreur_id;
            }
            
            $livraison->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Livraison mise à jour avec succès',
                'data' => $livraison
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified livraison from storage.
     */
    public function destroy(string $id)
    {
        try {
            $livraison = Livraison::findOrFail($id);
            
            // Plutôt que de supprimer la livraison, on la marque comme annulée
            $livraison->status = 'cancelled';
            $livraison->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Livraison annulée avec succès',
                'data' => $livraison
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de la livraison',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
