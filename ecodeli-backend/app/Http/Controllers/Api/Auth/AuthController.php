<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponder;
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Préparer les règles de validation de base
        $validationRules = [
            'name' => 'required_without:nom|string|max:255',
            'nom' => 'required_without:name|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:client,livreur,prestataire,commercant',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'country' => 'nullable|string',
            'lang' => 'nullable|string|in:fr,en',
        ];
        
        // Obtenir le rôle demandé, ou 'client' par défaut
        $requestedRole = $request->input('role', 'client');
        
        // Vérifier si le rôle nécessite un document d'identité
        $requiresIdentityDocument = in_array($requestedRole, ['livreur', 'prestataire', 'commercant']);
        
        // Si un document d'identité est requis, ajouter des règles de validation
        if ($requiresIdentityDocument) {
            $validationRules['identity_document'] = 'required|file|mimes:jpeg,png,jpg,pdf|max:2048';
            $validationRules['document_type'] = 'required|string|in:carte_identite,passeport,permis_conduire';
            $validationRules['document_number'] = 'nullable|string|max:50';
        }
        
        // Valider la requête
        $validated = $request->validate($validationRules);
        
        // Déterminer le statut en fonction du rôle
        $status = 'active'; // Par défaut
        if (in_array($requestedRole, ['livreur', 'prestataire', 'commercant'])) {
            $status = 'pending'; // En attente pour les rôles spécifiques
        }
        
        // Créer l'utilisateur
        $user = User::create([
            'name' => $validated['name'] ?? $validated['nom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'client', // Default role
            'status' => $status, // Définir le statut
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => $validated['country'] ?? null,
            'lang' => $validated['lang'] ?? 'fr',
        ]);
        
        // Si un document d'identité est requis, le traiter et créer l'entrée
        if ($requiresIdentityDocument && $request->hasFile('identity_document')) {
            $file = $request->file('identity_document');
            $path = $file->store('identity_documents/' . $user->id, 'public');
            
            // Créer l'entrée du document d'identité
            $user->identityDocuments()->create([
                'document_type' => $validated['document_type'],
                'document_number' => $validated['document_number'] ?? null,
                'file_path' => $path,
                'status' => 'pending', // Par défaut, le document est en attente de vérification
            ]);
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return $this->createdResponse([
            'user' => new UserResource($user),
            'token' => $token
        ], 'Utilisateur enregistré avec succès');
    }

    /**
     * Login a user and create a token.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            \Log::info('AuthController@login - Tentative de connexion', ['email' => $request->input('email')]);
            
            // Validation simplifiée - device_name complètement optionnel
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
                // device_name est optionnel et sera géré séparément
            ]);
            
            \Log::info('AuthController@login - Validation réussie');
            
            // Récupérer l'utilisateur
            $user = User::where('email', $validated['email'])->first();
            
            // Vérifier si l'utilisateur existe
            if (!$user) {
                \Log::info('AuthController@login - Utilisateur non trouvé', ['email' => $validated['email']]);
                return response()->json([
                    'message' => 'Erreur d\'authentification',
                    'errors' => ['email' => ['Aucun utilisateur trouvé avec cette adresse email.']]
                ], 401);
            }
            
            \Log::info('AuthController@login - Utilisateur trouvé', ['id' => $user->id, 'role' => $user->role]);
            
            // Vérifier le mot de passe
            if (!Hash::check($validated['password'], $user->password)) {
                \Log::info('AuthController@login - Mot de passe incorrect', ['id' => $user->id]);
                return response()->json([
                    'message' => 'Erreur d\'authentification',
                    'errors' => ['password' => ['Le mot de passe fourni est incorrect.']]
                ], 401);
            }
            
            \Log::info('AuthController@login - Mot de passe vérifié avec succès');
            
            // Vérifier le statut de l'utilisateur
            if ($user->status !== 'active') {
                \Log::info('AuthController@login - Accès refusé, compte non actif', ['id' => $user->id, 'status' => $user->status]);
                
                $messageMap = [
                    'pending' => 'Votre compte est en attente de validation par un administrateur.',
                    'rejected' => 'Votre demande d\'inscription a été refusée.'
                ];
                
                $message = $messageMap[$user->status] ?? 'Votre compte n\'est pas actif. Veuillez contacter un administrateur.';
                
                return response()->json([
                    'message' => 'Accès refusé',
                    'errors' => ['account' => [$message]]
                ], 403);
            }
            
            \Log::info('AuthController@login - Statut utilisateur vérifié avec succès');
            
            // Gestion du device_name - complètement optionnel
            // Priorité : 1. device_name fourni, 2. User-Agent, 3. Valeur par défaut
            $deviceName = $request->input('device_name') ?? $request->userAgent() ?? 'EcoDeli Device';
            
            try {
                // Créer un token avec Sanctum
                $token = $user->createToken($deviceName)->plainTextToken;
                \Log::info('AuthController@login - Token créé avec succès');
            } catch (\Exception $e) {
                \Log::error('AuthController@login - Erreur création token', ['message' => $e->getMessage()]);
                throw $e;
            }
            
            try {
                // Préparer la ressource utilisateur
                $userResource = new UserResource($user);
                \Log::info('AuthController@login - UserResource créée avec succès');
                
                // Préparer la réponse finale
                $responseData = [
                    'user' => $userResource,
                    'token' => $token
                ];
                
                \Log::info('AuthController@login - Réponse prête à être envoyée');
                
                // Retourner la réponse avec le token et l'utilisateur
                return $this->successResponse($responseData, 'Utilisateur connecté avec succès');
            } catch (\Exception $e) {
                \Log::error('AuthController@login - Erreur préparation réponse', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
            
        } catch (ValidationException $e) {
            // Retourner les erreurs de validation avec un format standard
            \Log::warning('AuthController@login - Erreur de validation', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
                'received_data' => $request->all()
            ], 422);
        } catch (\Exception $e) {
            // Capturer toute autre erreur
            \Log::error('AuthController@login - Exception non gérée', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'received_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'received_data' => $request->all()
            ], 500);
        }
    }

    /**
     * Logout the current user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Déconnexion réussie');
    }
    
    /**
     * Update the user's password.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string',
            ]);
            
            $user = $request->user();
            
            // Vérifier si le mot de passe actuel est correct
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect',
                    'errors' => ['current_password' => ['Le mot de passe actuel est incorrect.']]
                ], 422);
            }
            
            // Mettre à jour le mot de passe
            $user->password = Hash::make($validated['password']);
            $user->save();
            
            return $this->successResponse(null, 'Mot de passe modifié avec succès');
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification du mot de passe',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
