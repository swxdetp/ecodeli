<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PrestataireController extends Controller
{
    /**
     * Récupérer les données du tableau de bord
     */
    public function getDashboard()
    {
        try {
            $user = Auth::user();
            
            // Vérifier que l'utilisateur est un prestataire
            if ($user->role !== 'prestataire') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Rôle prestataire requis.'
                ], 403);
            }
            
            // Données réelles à implémenter 
            // Pour l'instant, utilisation de données factices pour le développement
            
            // Compter les prestations en cours
            $prestations_en_cours = DB::table('prestations')
                ->where('prestataire_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'in_progress'])
                ->count();
                
            // Compter les prestations terminées
            $prestations_terminees = DB::table('prestations')
                ->where('prestataire_id', $user->id)
                ->where('status', 'completed')
                ->count();
                
            // Calculer les revenus du mois
            $current_month = date('m');
            $current_year = date('Y');
            $revenus_mois = DB::table('prestations')
                ->where('prestataire_id', $user->id)
                ->where('status', 'completed')
                ->whereYear('completed_at', $current_year)
                ->whereMonth('completed_at', $current_month)
                ->sum('price');
                
            // Calculer les revenus totaux
            $revenus_total = DB::table('prestations')
                ->where('prestataire_id', $user->id)
                ->where('status', 'completed')
                ->sum('price');
                
            // Calculer la note moyenne
            $note_moyenne = DB::table('evaluations')
                ->where('prestataire_id', $user->id)
                ->avg('rating') ?? 0;
                
            // Récupérer les prestations récentes
            $prestations_recentes = DB::table('prestations as p')
                ->select('p.*', 'u.name as client_name')
                ->join('users as u', 'p.client_id', '=', 'u.id')
                ->where('p.prestataire_id', $user->id)
                ->orderBy('p.created_at', 'desc')
                ->limit(5)
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Données du tableau de bord récupérées avec succès',
                'data' => [
                    'prestations_en_cours' => $prestations_en_cours,
                    'prestations_terminees' => $prestations_terminees,
                    'revenus_mois' => $revenus_mois,
                    'revenus_total' => $revenus_total,
                    'note_moyenne' => $note_moyenne,
                    'prestations_recentes' => $prestations_recentes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du tableau de bord',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer le profil du prestataire
     */
    public function getProfil()
    {
        try {
            $user = Auth::user();
            
            // Récupérer les documents associés à ce prestataire
            $documents = DB::table('prestataire_documents')
                ->where('user_id', $user->id)
                ->get();
                
            return response()->json([
                'success' => true,
                'message' => 'Profil récupéré avec succès',
                'data' => [
                    'user' => $user,
                    'documents' => $documents
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil du prestataire
     */
    public function updateProfil(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validation des données
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|max:20',
                'address' => 'sometimes|string|max:255',
                'city' => 'sometimes|string|max:100',
                'postal_code' => 'sometimes|string|max:20',
                'biography' => 'sometimes|string|nullable',
            ]);
            
            // Mise à jour des données
            $user->update($validatedData);
            
            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un document (pièce d'identité, diplômes, certifications...)
     */
    public function uploadDocument(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validation du fichier
            $request->validate([
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5Mo
                'type' => 'required|string|in:identity,certification,diploma,insurance,other'
            ]);
            
            // Téléchargement du fichier
            $file = $request->file('document');
            $path = $file->store('documents/prestataire/' . $user->id, 'public');
            
            // Enregistrement des métadonnées dans la base de données
            $document_id = DB::table('prestataire_documents')->insertGetId([
                'user_id' => $user->id,
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'type' => $request->type,
                'status' => 'pending',
                'uploaded_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Récupérer le document créé
            $document = DB::table('prestataire_documents')
                ->where('id', $document_id)
                ->first();
                
            return response()->json([
                'success' => true,
                'message' => 'Document téléchargé avec succès',
                'data' => $document
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer tous les documents du prestataire
     */
    public function getDocuments()
    {
        try {
            $user = Auth::user();
            
            $documents = DB::table('prestataire_documents')
                ->where('user_id', $user->id)
                ->orderBy('uploaded_at', 'desc')
                ->get();
                
            return response()->json([
                'success' => true,
                'message' => 'Documents récupérés avec succès',
                'data' => $documents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Supprimer un document
     */
    public function deleteDocument($id)
    {
        try {
            $user = Auth::user();
            
            // Vérifier que le document appartient bien au prestataire
            $document = DB::table('prestataire_documents')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();
                
            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document non trouvé ou non autorisé'
                ], 404);
            }
            
            // Supprimer le fichier du stockage
            if (Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }
            
            // Supprimer l'entrée de la base de données
            DB::table('prestataire_documents')
                ->where('id', $id)
                ->delete();
                
            return response()->json([
                'success' => true,
                'message' => 'Document supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupérer les types de prestations disponibles
     */
    public function getTypesPrestations()
    {
        try {
            $user = Auth::user();
            
            // Récupérer tous les types de prestations disponibles
            $types_disponibles = DB::table('types_prestations')
                ->get();
                
            // Récupérer les types de prestations que le prestataire peut réaliser
            $types_prestataire = DB::table('prestataire_types')
                ->where('user_id', $user->id)
                ->pluck('type_id')
                ->toArray();
                
            return response()->json([
                'success' => true,
                'message' => 'Types de prestations récupérés avec succès',
                'data' => [
                    'types_disponibles' => $types_disponibles,
                    'types_prestataire' => $types_prestataire
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des types de prestations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mettre à jour les types de prestations que le prestataire peut réaliser
     */
    public function updateTypesPrestations(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validation des données
            $request->validate([
                'typesPrestations' => 'required|array',
                'typesPrestations.*' => 'integer|exists:types_prestations,id'
            ]);
            
            // Supprimer les anciens types
            DB::table('prestataire_types')
                ->where('user_id', $user->id)
                ->delete();
                
            // Ajouter les nouveaux types
            $data = [];
            foreach ($request->typesPrestations as $type_id) {
                $data[] = [
                    'user_id' => $user->id,
                    'type_id' => $type_id,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            
            DB::table('prestataire_types')->insert($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Types de prestations mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des types de prestations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
