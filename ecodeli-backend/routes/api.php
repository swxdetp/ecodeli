<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\AnnonceController as AdminAnnonceController;
use App\Http\Controllers\Api\Admin\LivraisonController as AdminLivraisonController;
use App\Http\Controllers\Api\Admin\InvitationController;
use App\Http\Controllers\Api\Dashboard\AdminDashboardController;
use App\Http\Controllers\Api\Livreur\AnnonceController as LivreurAnnonceController;
use App\Http\Controllers\Api\Livreur\LivraisonController as LivreurLivraisonController;
use App\Http\Controllers\Api\Prestataire\PrestataireController;
use App\Http\Controllers\Api\Prestataire\PrestationController;
use App\Http\Controllers\Api\Prestataire\DisponibiliteController;
use App\Http\Controllers\Api\Prestataire\FactureController;
use App\Http\Controllers\Api\Prestataire\EvaluationController;

// Routes d'authentification
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Route de test pour vérifier l'authentification
Route::get('/auth-test', function (Request $request) {
    if (auth()->check()) {
        return response()->json([
            'success' => true, 
            'message' => 'Authentifié avec succès', 
            'user' => auth()->user()
        ]);
    }
    return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
});

// Route publique pour afficher toutes les annonces disponibles
Route::get('/listings', function () {
    try {
        $annonces = DB::table('annonces')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Liste des annonces récupérée avec succès',
            'data' => $annonces
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des annonces: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

// Routes pour la gestion des avis clients (NFC)
Route::post('/reviews', [App\Http\Controllers\Api\DeliveryReviewController::class, 'createReview']);
Route::get('/livreur/{id}/reviews', [App\Http\Controllers\Api\DeliveryReviewController::class, 'getLivreurReviews']);
Route::get('/livreur/{id}/review-stats', [App\Http\Controllers\Api\DeliveryReviewController::class, 'getLivreurReviewStats']);

// Route publique pour afficher les détails d'une annonce spécifique
Route::get('/listings/{id}', function ($id) {
    try {
        // Récupérer tous les champs de l'annonce avec une requête brute
        $annonce = DB::table('annonces')
            ->where('id', $id)
            ->first();
            
        if (!$annonce) {
            return response()->json([
                'success' => false,
                'message' => 'Annonce non trouvée',
                'data' => null
            ], 404);
        }
        
        // Récupérer l'auteur de l'annonce
        $author = DB::table('users')
            ->select('id', 'name', 'email')
            ->where('id', $annonce->user_id)
            ->first();

        // Convertir en tableau pour pouvoir ajouter/modifier des champs
        $annonceArray = (array) $annonce;
        
        // Préparer les données formatées pour le frontend avec le mapping correct des champs
        $formattedData = [
            'id' => $annonceArray['id'],
            'user_id' => $annonceArray['user_id'],
            'title' => $annonceArray['title'],
            'description' => $annonceArray['description'],
            'status' => $annonceArray['status'],
            'type' => $annonceArray['type'],
            
            // Mappage explicite des champs du backend vers les noms attendus par le frontend
            'pickup_address' => $annonceArray['address_from'] ?? 'Non spécifiée',
            'delivery_address' => $annonceArray['address_to'] ?? 'Non spécifiée',
            'delivery_date' => $annonceArray['date_to'] ?? null,
            'price' => $annonceArray['price'] ?? 0,
            
            // Conserver également les champs originaux pour compatibilité
            'address_from' => $annonceArray['address_from'] ?? null,
            'address_to' => $annonceArray['address_to'] ?? null,
            'date_from' => $annonceArray['date_from'] ?? null,
            'date_to' => $annonceArray['date_to'] ?? null,
            
            // Ajouter les autres champs
            'weight' => $annonceArray['weight'] ?? null,
            'dimensions' => $annonceArray['dimensions'] ?? null,
            'is_fragile' => $annonceArray['is_fragile'] ?? 0,
            'is_urgent' => $annonceArray['is_urgent'] ?? 0,
            'photos' => $annonceArray['photos'] ?? null,
            'created_at' => $annonceArray['created_at'],
            'updated_at' => $annonceArray['updated_at'],
            
            // Ajouter les informations de l'auteur
            'author' => $author ? (array) $author : null,
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de l\'annonce récupérés avec succès',
            'data' => $formattedData
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des détails de l\'annonce: ' . $e->getMessage(),
            'data' => null
        ], 500);
    }
});

// Route de diagnostic spécifique pour les annonces
Route::get('/diagnostic/annonce/{id}', function ($id) {
    try {
        // Récupérer les données brutes de l'annonce
        $annonce = DB::table('annonces')->where('id', $id)->first();
        
        if (!$annonce) {
            return response()->json([
                'success' => false,
                'message' => 'Annonce introuvable'
            ], 404);
        }
        
        // Obtenir la liste des colonnes de la table annonces
        $columns = DB::select('SHOW COLUMNS FROM annonces');
        $columnNames = array_map(function($col) { return $col->Field; }, $columns);
        
        // Créer une annonce avec des valeurs test pour comparaison
        $testData = [
            'pickup_address' => '123 Rue Test, 75001 Paris',
            'delivery_address' => '456 Avenue Exemple, 75002 Paris',
            'delivery_date' => '2025-07-15',
            'price' => 15.99
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Diagnostic de l\'annonce #' . $id,
            'data' => [
                'annonce_data' => $annonce,
                'annonce_as_array' => (array)$annonce,
                'table_structure' => $columnNames,
                'test_data' => $testData
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du diagnostic: ' . $e->getMessage()
        ], 500);
    }
});

// Routes de test publiques (sans authentification) pour déboguer
Route::prefix('public')->group(function () {
    // Route publique pour les livraisons (sans authentification)
    Route::get('/livraisons', function () {
        try {
            // Récupérer les livraisons avec des informations de base
            // Sans utiliser la colonne client_id qui n'existe pas
            $livraisons = DB::table('livraisons as l')
                ->select('l.*', 'a.title as annonce_title', 'u1.name as livreur_name')
                ->leftJoin('annonces as a', 'l.annonce_id', '=', 'a.id')
                ->leftJoin('users as u1', 'l.livreur_id', '=', 'u1.id')
                ->orderBy('l.created_at', 'desc')
                ->get();
            
            // Formater pour l'API
            $formattedLivraisons = [];
            foreach ($livraisons as $livraison) {
                $formattedLivraisons[] = [
                    'id' => $livraison->id,
                    'status' => $livraison->status,
                    'created_at' => $livraison->created_at,
                    'updated_at' => $livraison->updated_at,
                    'annonce' => [
                        'id' => $livraison->annonce_id,
                        'title' => $livraison->annonce_title,
                    ],
                    'livreur' => [
                        'id' => $livraison->livreur_id,
                        'name' => $livraison->livreur_name,
                    ]
                ];
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Liste des livraisons récupérée avec succès',
                'data' => $formattedLivraisons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des livraisons',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Endpoint de diagnostic pour la table livraisons
    Route::get('/diagnostic-livraisons', function () {
        try {
            // Vérifier si la table existe
            $tableExists = DB::select("SHOW TABLES LIKE 'livraisons'");
            
            // Vérifier la structure de la table
            $tableStructure = [];
            if (!empty($tableExists)) {
                $tableStructure = DB::select('DESCRIBE livraisons');
            }
            
            // Compter les enregistrements
            $count = DB::table('livraisons')->count();
            
            // Récupérer quelques enregistrements pour diagnostic
            $sampleData = [];
            if ($count > 0) {
                $sampleData = DB::table('livraisons')
                    ->select('id', 'annonce_id', 'livreur_id', 'status', 'created_at')
                    ->limit(5)
                    ->get();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Diagnostic de la table livraisons',
                'data' => [
                    'table_exists' => !empty($tableExists),
                    'table_structure' => $tableStructure,
                    'record_count' => $count,
                    'sample_data' => $sampleData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du diagnostic de la table livraisons',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    // Endpoint test livreur (sans authentification)
    Route::get('/livreur/livraisons', function () {
        return response()->json([
            'success' => true,
            'message' => 'Données livreur accessibles sans authentification',
            'data' => [
                [
                    'id' => 1,
                    'annonce' => [
                        'title' => 'Livraison de test 1',
                        'address_from' => '242 Rue du Faubourg Saint-Antoine, 75012 Paris',
                        'address_to' => '38 Rue du Louvre, 75001 Paris',
                        'description' => 'Colis urgent à livrer',
                        'price' => 25.50
                    ],
                    'status' => 'pending',
                    'start_date' => '2025-06-29T14:00:00'
                ],
                [
                    'id' => 2,
                    'annonce' => [
                        'title' => 'Livraison de test 2',
                        'address_from' => '242 Rue du Faubourg Saint-Antoine, 75012 Paris',
                        'address_to' => '5 Rue de Rivoli, 75001 Paris',
                        'description' => 'Documents importants',
                        'price' => 18.00
                    ],
                    'status' => 'accepted',
                    'start_date' => '2025-06-30T09:00:00'
                ]
            ]
        ]);
    });
    
    // Route pour le profil livreur (sans authentification)
    Route::get('/livreur/profil', function () {
        // Simuler les données d'un profil livreur
        return response()->json([
            'success' => true,
            'message' => 'Profil livreur récupéré avec succès',
            'data' => [
                'id' => 1,
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@ecodeli.fr',
                // Utiliser les noms de champs attendus par le frontend
                'phone' => '06 12 34 56 78',  // au lieu de 'telephone'
                'address' => '123 Rue de Paris, 75001 Paris',  // au lieu de 'adresse'
                'photo' => null,
                'status' => 'active',
                'rating' => 4.8,
                'total_deliveries' => 156,
                'pending_deliveries' => 3,
                'created_at' => '2023-01-15T10:30:00'
            ]
        ]);
    });
    
    Route::get('/livreur/annonces', function () {
        return response()->json([
            'success' => true,
            'message' => 'Annonces accessibles sans authentification',
            'data' => [
                [
                    'id' => 3,
                    'title' => 'Annonce de test 1',
                    'address_from' => '242 Rue du Faubourg Saint-Antoine, 75012 Paris',
                    'address_to' => '15 Rue de la Paix, 75002 Paris',
                    'description' => 'Colis fragile',
                    'price' => 22.00
                ],
                [
                    'id' => 4,
                    'title' => 'Annonce de test 2',
                    'address_from' => '242 Rue du Faubourg Saint-Antoine, 75012 Paris',
                    'address_to' => '65 Rue de Lyon, 75012 Paris',
                    'description' => 'Petit paquet',
                    'price' => 12.50
                ]
            ]
        ]);
    });
});

// Middleware protégeant les routes qui suivent
// Toutes ces routes nécessitent une authentification
Route::middleware('auth:api')->group(function () {
    // Route de déconnexion
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Route pour mettre à jour le mot de passe
    Route::post('/auth/update-password', [AuthController::class, 'updatePassword']);
    
    // Route d'information sur l'utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Route pour télécharger les documents d'identité de l'utilisateur connecté
    Route::get('/user/identity-documents', function (Request $request) {
        try {
            $user = $request->user();
            $documents = $user->identityDocuments;
            
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
    });
    
    // Route pour télécharger un document d'identité spécifique
    Route::get('/user/identity-documents/{id}/download', function (Request $request, $id) {
        try {
            $user = $request->user();
            $document = $user->identityDocuments()->findOrFail($id);
            
            // Vérifier que le fichier existe
            $filePath = storage_path('app/public/' . $document->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le fichier n\'existe pas'
                ], 404);
            }
            
            // Déterminer le type MIME du fichier
            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            $mimeTypes = [
                'pdf' => 'application/pdf',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png'
            ];
            
            $contentType = $mimeTypes[$extension] ?? 'application/octet-stream';
            
            // Générer un nom de fichier pour le téléchargement
            $fileName = 'document-identite-' . $document->document_type . '.' . $extension;
            
            return response()->file($filePath, [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du document',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Routes pour les clients authentifiés
    Route::prefix('client')->group(function () {
        // Gestion des annonces par le client
        Route::apiResource('/annonces', \App\Http\Controllers\Api\Client\AnnonceController::class);
    });
    
    // Routes pour l'administration - Avec middleware admin correctement configuré
    Route::prefix('admin')->middleware(['auth', 'admin'])->group(function() {
        // Gestion des utilisateurs - Routes originales restaurées
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        
        // Gestion des annonces - Routes originales restaurées
        Route::get('/annonces', [AdminAnnonceController::class, 'index']);
        Route::get('/annonces/{id}', [AdminAnnonceController::class, 'show']);
        Route::put('/annonces/{id}', [AdminAnnonceController::class, 'update']);
        Route::delete('/annonces/{id}', [AdminAnnonceController::class, 'destroy']);
        
        // Gestion des livraisons - Routes originales restaurées
        Route::get('/livraisons', [AdminLivraisonController::class, 'index']);
        Route::get('/livraisons/{id}', [AdminLivraisonController::class, 'show']);
        Route::put('/livraisons/{id}', [AdminLivraisonController::class, 'update']);
        Route::delete('/livraisons/{id}', [AdminLivraisonController::class, 'destroy']);
        
        // Gestion des invitations - Routes originales restaurées
        Route::get('/invitations', [InvitationController::class, 'index']);
        Route::post('/invitations/{id}/accept', [InvitationController::class, 'accept']);
        Route::post('/invitations/{id}/reject', [InvitationController::class, 'reject']);
        
        // Routes pour la validation des livraisons - Routes originales restaurées
        Route::get('/livraisons/pending', [AdminLivraisonController::class, 'pendingDeliveries']);
        Route::put('/livraisons/{id}/validate', [AdminLivraisonController::class, 'validateDelivery']);
        Route::put('/livraisons/{id}/refuse', [AdminLivraisonController::class, 'refuseDelivery']);
    });
    
    // === ROUTES DE SECOURS POUR LE DASHBOARD ADMIN (SANS MIDDLEWARE) ===
    // Ces routes utilisent du SQL direct pour éviter les problèmes avec Eloquent et les relations
    Route::get('/admin/users-list', function() {
        try {
            $users = DB::select('SELECT * FROM users');
            return response()->json([
                'success' => true,
                'message' => 'Liste des utilisateurs récupérée avec succès',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    Route::get('/admin/annonces-list', function() {
        try {
            $annonces = DB::select('SELECT a.*, u.name as client_name FROM annonces a LEFT JOIN users u ON a.client_id = u.id ORDER BY a.created_at DESC');
            return response()->json([
                'success' => true,
                'message' => 'Liste des annonces récupérée avec succès',
                'data' => $annonces
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des annonces',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    Route::get('/admin/livraisons-list', function() {
        try {
            $livraisons = DB::select('SELECT l.*, a.title as annonce_title, u1.name as livreur_name, u2.name as client_name 
                                 FROM livraisons l 
                                 LEFT JOIN annonces a ON l.annonce_id = a.id 
                                 LEFT JOIN users u1 ON l.livreur_id = u1.id 
                                 LEFT JOIN users u2 ON a.client_id = u2.id 
                                 ORDER BY l.created_at DESC');
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
    });
    
    // Route pour les invitations (version SQL direct)
    Route::get('/admin/invitations', function() {
        try {
            $invitations = DB::select('SELECT u.*, d.document_path, d.document_type, d.status as document_status 
                                FROM users u 
                                LEFT JOIN identity_documents d ON u.id = d.user_id 
                                WHERE u.status = "pending" 
                                ORDER BY u.created_at DESC');
            return response()->json([
                'success' => true,
                'message' => 'Liste des invitations récupérée avec succès',
                'data' => $invitations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des invitations',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Route pour les livraisons en attente de validation (version SQL direct)
    Route::get('/admin/livraisons/pending', function() {
        try {
            $pendingLivraisons = DB::select('SELECT l.*, a.title as annonce_title, a.address_from, a.address_to, 
                                        u1.name as livreur_name, u1.email as livreur_email,
                                        u2.name as client_name, u2.email as client_email
                                 FROM livraisons l 
                                 LEFT JOIN annonces a ON l.annonce_id = a.id 
                                 LEFT JOIN users u1 ON l.livreur_id = u1.id 
                                 LEFT JOIN users u2 ON a.client_id = u2.id 
                                 WHERE l.status = "delivered"
                                 ORDER BY l.created_at DESC');
            return response()->json([
                'success' => true,
                'message' => 'Liste des livraisons en attente de validation récupérée avec succès',
                'data' => $pendingLivraisons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des livraisons en attente',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Routes temporaires pour le développement (sans middleware)
    Route::get('/admin/users-list', function() {
        try {
            // Requête SQL directe pour éviter les problèmes liés aux modèles/relations
            $users = DB::select('SELECT * FROM users');
            
            return response()->json([
                'success' => true,
                'message' => 'Liste des utilisateurs récupérée avec succès',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    });
    
    // Routes pour la validation des livraisons
    Route::get('/admin/livraisons/pending', [AdminLivraisonController::class, 'pendingDeliveries']);
    Route::put('/admin/livraisons/{livraison}/validate', [AdminLivraisonController::class, 'validateDelivery']);
    Route::put('/admin/livraisons/{livraison}/refuse', [AdminLivraisonController::class, 'refuseDelivery']);
    
    // Route simplifiée pour récupération des livraisons
    Route::get('/admin/livraisons-list', function() {
        try {
            // Requête SQL directe pour éviter les problèmes liés aux modèles/relations
            $livraisons = DB::select('SELECT l.*, a.title as annonce_title, 
                                       u1.name as livreur_name, u2.name as client_name 
                                FROM livraisons l 
                                LEFT JOIN annonces a ON l.annonce_id = a.id 
                                LEFT JOIN users u1 ON l.livreur_id = u1.id 
                                LEFT JOIN users u2 ON a.client_id = u2.id 
                                ORDER BY l.created_at DESC');
            
            // Transformer les données pour correspondre au format attendu
            $formattedLivraisons = array_map(function($livraison) {
                return [
                    'id' => $livraison->id,
                    'status' => $livraison->status,
                    'created_at' => $livraison->created_at,
                    'updated_at' => $livraison->updated_at,
                    'annonce' => [
                        'id' => $livraison->annonce_id,
                        'title' => $livraison->annonce_title
                    ],
                    'livreur' => [
                        'id' => $livraison->livreur_id,
                        'name' => $livraison->livreur_name
                    ],
                    'client' => [
                        'name' => $livraison->client_name
                    ]
                ];
            }, $livraisons);
            
            return response()->json([
                'success' => true,
                'message' => 'Liste des livraisons récupérée avec succès',
                'data' => $formattedLivraisons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des livraisons',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    });
    
    // Route publique pour récupération des annonces admin
    Route::get('/admin/annonces-list', function() {
        try {
            // Requête SQL directe pour éviter les problèmes liés aux modèles/relations
            $annonces = DB::select('SELECT * FROM annonces');
            return response()->json([
                'success' => true, 
                'message' => 'Liste des annonces récupérée avec succès',
                'data' => $annonces
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des annonces',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    });
    
    // Routes Admin
    // Routes pour les administrateurs
    Route::group(['prefix' => 'admin', 'middleware' => ['auth:sanctum']], function () { // Middleware 'admin' temporairement désactivé pour tests
        // Dashboard admin
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        
        // Gestion des invitations
        Route::get('/invitations', [InvitationController::class, 'index']);
        Route::put('/invitations/refuse/{id}', [InvitationController::class, 'refuse']);
        Route::post('/invitations/{id}/accept', [InvitationController::class, 'accept']);
        Route::post('/invitations/{id}/reject', [InvitationController::class, 'reject']);
        
        // Gestion des validations de livraisons
        Route::get('/livraisons/pending', [AdminLivraisonController::class, 'pendingDeliveries']);
        Route::put('/livraisons/{livraison}/validate', [AdminLivraisonController::class, 'validateDelivery']);
        Route::put('/livraisons/{livraison}/refuse', [AdminLivraisonController::class, 'refuseDelivery']);
        
        // Gestion des utilisateurs
        // Route spéciale simplifiée pour le tableau de bord admin
        Route::get('/users-public', function() {
            try {
                $users = \App\Models\User::all(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
                return response()->json([
                    'success' => true,
                    'message' => 'Liste des utilisateurs récupérée avec succès',
                    'data' => $users
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la récupération des utilisateurs'
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage()
                ], 500);
            }
        });
    });

    // Gestion des livraisons
    Route::get('/livraisons/pending', [AdminLivraisonController::class, 'pendingDeliveries']);
    Route::get('/livraisons', [AdminLivraisonController::class, 'index']);
    Route::get('/livraisons/{id}', [AdminLivraisonController::class, 'show']);
    Route::put('/livraisons/{id}/validate', [AdminLivraisonController::class, 'validateDelivery']);
    Route::put('/livraisons/{id}/refuse', [AdminLivraisonController::class, 'refuseDelivery']);
    
    // Tableau de bord admin
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats']);
    
    // Gestion des invitations
    Route::get('/invitations', [InvitationController::class, 'index']);
    Route::put('/invitations/{id}/accept', [InvitationController::class, 'accept']);
    Route::put('/invitations/{id}/reject', [InvitationController::class, 'reject']);
});

// Routes Livreur - Temporairement sans middleware de rôle pour diagnostic
Route::middleware('auth:sanctum')->prefix('livreur')->group(function () {
    // Dashboard livreur
    Route::get('/dashboard', [LivreurLivraisonController::class, 'dashboard']);
    
    // Gestion des livraisons
    Route::get('/livraisons', [LivreurLivraisonController::class, 'index']);
    Route::get('/livraisons/{livraison}', [LivreurLivraisonController::class, 'show']);
    Route::put('/livraisons/{livraison}', [LivreurLivraisonController::class, 'update']);
    Route::put('/livraisons/{livraison}/status', [LivreurLivraisonController::class, 'updateStatus']);
    Route::delete('/livraisons/{livraison}', [LivreurLivraisonController::class, 'destroy']);
    
    // Gestion des annonces
    Route::get('/annonces', [LivreurAnnonceController::class, 'index']);
    // Routes pour l'acceptation et le refus d'annonces
    Route::post('/annonces/{id}/accepter', [LivreurAnnonceController::class, 'accepter']);
    Route::post('/annonces/{id}/refuser', [LivreurAnnonceController::class, 'refuser']);
    
    // Routes alternatives pour correspondre à la structure attendue par le frontend
    Route::post('/livreur/annonces/{id}/accepter', [LivreurAnnonceController::class, 'accepter']);
    Route::post('/livreur/annonces/{id}/refuser', [LivreurAnnonceController::class, 'refuser']);
    
    // Profil livreur
    Route::get('/profil', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Profil récupéré avec succès',
            'data' => $request->user()
        ]);
    });
    
    // Mise à jour du profil livreur
    Route::put('/profil', function (Request $request) {
        try {
            $user = $request->user();
            
            // Valider les données
            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
                'phone' => 'sometimes|string|max:20|nullable',
                'address' => 'sometimes|string|max:255|nullable',
                'password' => 'sometimes|string|min:8|nullable',
            ]);
            
            // Mettre à jour le mot de passe si fourni
            if (isset($validatedData['password']) && !empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }
            
            // Mettre à jour l'utilisateur
            $user->update($validatedData);
            
            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil: ' . $e->getMessage()
            ], 500);
        }
    });
    
    Route::get('/dashboard', [LivreurLivraisonController::class, 'dashboard']);
        
        // Gestion des livraisons
        Route::get('/livraisons', [LivreurLivraisonController::class, 'index']);
        Route::get('/livraisons/{livraison}', [LivreurLivraisonController::class, 'show']);
        Route::put('/livraisons/{livraison}', [LivreurLivraisonController::class, 'update']);
        Route::put('/livraisons/{livraison}/status', [LivreurLivraisonController::class, 'updateStatus']);
        Route::delete('/livraisons/{livraison}', [LivreurLivraisonController::class, 'destroy']);
        
        // Gestion des annonces
        Route::get('/annonces', [LivreurAnnonceController::class, 'index']);
        Route::post('/annonces/{id}/accepter', [LivreurAnnonceController::class, 'accepter']);
        Route::post('/annonces/{id}/refuser', [LivreurAnnonceController::class, 'refuser']);
        
        // Profil livreur
        Route::get('/profil', function (Request $request) {
            return response()->json([
                'success' => true,
                'message' => 'Profil récupéré avec succès',
                'data' => $request->user()
            ]);
        });
        
        // Mise à jour du profil livreur
        Route::put('/profil', function (Request $request) {
            try {
                $user = $request->user();
                
                // Valider les données
                $validatedData = $request->validate([
                    'name' => 'sometimes|string|max:255',
                    'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
                    'phone' => 'sometimes|string|max:20|nullable',
                    'address' => 'sometimes|string|max:255|nullable',
                    'password' => 'sometimes|string|min:8|nullable',
                ]);
                
                // Mettre à jour le mot de passe si fourni
                if (isset($validatedData['password']) && !empty($validatedData['password'])) {
                    $validatedData['password'] = bcrypt($validatedData['password']);
                } else {
                    unset($validatedData['password']);
                }
                
                // Mettre à jour l'utilisateur
                $user->update($validatedData);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Profil mis à jour avec succès',
                    'data' => $user
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la mise à jour du profil: ' . $e->getMessage()
                ], 500);
            }
        });
        
        // Alternative POST pour la mise à jour du profil (au cas où le frontend utilise POST au lieu de PUT)
        Route::post('/profil/update', function (Request $request) {
            try {
                $user = $request->user();
                
                // Valider les données
                $validatedData = $request->validate([
                    'name' => 'sometimes|string|max:255',
                    'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
                    'phone' => 'sometimes|string|max:20|nullable',
                    'address' => 'sometimes|string|max:255|nullable',
                    'password' => 'sometimes|string|min:8|nullable',
                ]);
                
                // Mettre à jour le mot de passe si fourni
                if (isset($validatedData['password']) && !empty($validatedData['password'])) {
                    $validatedData['password'] = bcrypt($validatedData['password']);
                } else {
                    unset($validatedData['password']);
                }
                
                // Mettre à jour l'utilisateur
                $user->update($validatedData);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Profil mis à jour avec succès',
                    'data' => $user
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la mise à jour du profil: ' . $e->getMessage()
                ], 500);
            }
        });
        
        // Route de test pour le livreur
        Route::get('/test', function () {
            return response()->json([
                'success' => true,
                'message' => 'Route livreur accessible',
                'data' => [
                    ['id' => 1, 'title' => 'Test livraison 1'],
                    ['id' => 2, 'title' => 'Test livraison 2']
                ]
            ]);
        });
    });
// Accolade fermante en trop supprimée ici

// API routes auxiliaires pour débogage front-end
// Ces routes aident à la compatibilité avec les requêtes comportant /api/api/ en doublon
Route::prefix('api')->group(function () {
    Route::get('/livreur/dashboard', function (Request $request) {
        return redirect('/api/livreur/dashboard');
    });
    
    Route::get('/livreur/livraisons', function (Request $request) {
        return redirect('/api/livreur/livraisons');
    });
    
    Route::get('/livreur/livraisons/{any}', function (Request $request, $any) {
        return redirect('/api/livreur/livraisons/' . $any);
    });
    
    // Support pour la méthode DELETE - correction du double préfixe api
    Route::delete('/livreur/livraisons/{any}', function (Request $request, $any) {
        return redirect()->to('/api/livreur/livraisons/' . $any, 307);
    });
    
    Route::get('/livreur/annonces', function (Request $request) {
        return redirect('/api/livreur/annonces');
    });
    
    Route::get('/livreur/annonces/{any}', function (Request $request, $any) {
        return redirect('/api/livreur/annonces/' . $any);
    });
});

// Routes pour le système d'avis client (Reviews via NFC)
Route::post('/reviews', [\App\Http\Controllers\Api\DeliveryReviewController::class, 'createReview']);
Route::get('/livreur/{livreurId}/reviews', [\App\Http\Controllers\Api\DeliveryReviewController::class, 'getLivreurReviews']);
Route::get('/livreur/{livreurId}/review-stats', [\App\Http\Controllers\Api\DeliveryReviewController::class, 'getLivreurReviewStats']);
