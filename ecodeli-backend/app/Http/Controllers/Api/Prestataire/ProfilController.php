<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Traits\ApiResponder;

class ProfilController extends Controller
{
    use ApiResponder;
    /**
     * Display the prestataire's profile.
     */
    public function show()
    {
        $user = Auth::user();
        $user->load('prestataire', 'prestataire.typesPrestation', 'documents');
        
        return $this->successResponse(
            $user,
            'Profil prestataire récupéré avec succès'
        );
    }

    /**
     * Update the prestataire's profile.
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validation des données utilisateur
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:100',
                'prenom' => 'sometimes|string|max:100',
                'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
                'telephone' => 'sometimes|string|max:20',
                'adresse' => 'sometimes|string|max:255',
                'ville' => 'sometimes|string|max:100',
                'code_postal' => 'sometimes|string|max:10',
                'description' => 'sometimes|string|max:1000',
                'password' => 'sometimes|string|min:8|confirmed',
                'photo_url' => 'sometimes|nullable|string',
                
                // Champs spécifiques au prestataire
                'prestataire.tarif_horaire' => 'sometimes|numeric|min:0',
                'prestataire.experience_annees' => 'sometimes|integer|min:0',
                'prestataire.rayon_intervention_km' => 'sometimes|integer|min:0',
                'prestataire.certifications' => 'sometimes|string|max:500',
                'prestataire.diplomes' => 'sometimes|string|max:500',
                'prestataire.types_prestation' => 'sometimes|array',
                'prestataire.types_prestation.*' => 'exists:types_prestation,id'
            ]);
            
            // Mise à jour des données utilisateur
            $userData = array_filter($validated, function($key) {
                return !in_array($key, ['password', 'prestataire']);
            }, ARRAY_FILTER_USE_KEY);
            
            // Si le mot de passe est fourni, le hasher
            if (isset($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }
            
            // Mettre à jour les informations utilisateur
            if (!empty($userData)) {
                $user->update($userData);
            }
            
            // Mettre à jour les informations de prestataire
            if (isset($validated['prestataire']) && $user->prestataire) {
                $prestataireData = $validated['prestataire'];
                
                // Mettre à jour les champs simples
                $simpleFields = [
                    'tarif_horaire', 'experience_annees', 'rayon_intervention_km',
                    'certifications', 'diplomes'
                ];
                
                foreach ($simpleFields as $field) {
                    if (isset($prestataireData[$field])) {
                        $user->prestataire->$field = $prestataireData[$field];
                    }
                }
                
                $user->prestataire->save();
                
                // Mettre à jour les types de prestation si fournis
                if (isset($prestataireData['types_prestation'])) {
                    $user->prestataire->typesPrestation()->sync($prestataireData['types_prestation']);
                }
            }
            
            // Recharger l'utilisateur avec ses relations
            $user->load('prestataire', 'prestataire.typesPrestation', 'documents');
            
            return $this->successResponse(
                $user,
                'Profil prestataire mis à jour avec succès'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la mise à jour du profil: ' . $e->getMessage(),
                500
            );
        }
    }
    
    /**
     * Upload a document for the prestataire.
     */
    public function uploadDocument(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:id_card,permit,diploma,certification,other',
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
                'description' => 'sometimes|string|max:255'
            ]);
            
            $user = Auth::user();
            $file = $request->file('document');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Stocker le fichier
            $path = $file->storeAs(
                'documents/' . $user->id,
                $fileName,
                'public'
            );
            
            // Créer l'entrée dans la base de données
            $document = $user->documents()->create([
                'type' => $validated['type'],
                'path' => $path,
                'filename' => $fileName,
                'description' => $validated['description'] ?? null,
                'status' => 'pending' // En attente de validation
            ]);
            
            return $this->successResponse(
                $document,
                'Document téléchargé avec succès'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors du téléchargement du document: ' . $e->getMessage(),
                500
            );
        }
    }
}
