<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InvitationController extends Controller
{
    /**
     * Récupère toutes les invitations en attente
     */
    public function index()
    {
        try {
            // Récupérer les utilisateurs avec status 'pending' et rôle de type livreur, commercant ou prestataire
            $invitations = DB::table('users')
                ->where('status', 'pending')
                ->whereIn('role', ['livreur', 'commercant', 'prestataire'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Liste des invitations récupérée avec succès',
                'data' => $invitations
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des invitations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des invitations: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Récupère les détails d'une invitation spécifique
     */
    public function show($id)
    {
        try {
            $invitation = DB::table('users')
                ->where('id', $id)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation non trouvée',
                    'data' => null
                ], 404);
            }

            // Récupérer les documents si disponibles
            $documents = DB::table('user_documents')
                ->where('user_id', $id)
                ->get();

            // Convertir l'invitation en tableau pour pouvoir ajouter les documents
            $invitationArray = (array) $invitation;
            $invitationArray['documents'] = $documents;

            return response()->json([
                'success' => true,
                'message' => 'Détails de l\'invitation récupérés avec succès',
                'data' => $invitationArray
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des détails de l\'invitation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des détails de l\'invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accepte une invitation
     */
    public function accept($id)
    {
        try {
            $invitation = User::where('id', $id)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation non trouvée',
                    'data' => null
                ], 404);
            }

            // Mettre à jour le statut de l'utilisateur
            $invitation->status = 'active';
            $invitation->save();

            // Envoyer un email de confirmation (si possible)
            try {
                $this->sendAcceptanceEmail($invitation);
            } catch (\Exception $emailError) {
                Log::warning('Erreur lors de l\'envoi du mail d\'acceptation: ' . $emailError->getMessage());
                // Continuer même si l'envoi d'email échoue
            }

            return response()->json([
                'success' => true,
                'message' => 'Invitation acceptée avec succès',
                'data' => $invitation
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'acceptation de l\'invitation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'acceptation de l\'invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejette une invitation
     */
    public function reject(Request $request, $id)
    {
        try {
            $invitation = User::where('id', $id)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation non trouvée',
                    'data' => null
                ], 404);
            }

            // Récupérer la raison du rejet (optionnelle)
            $reason = $request->input('reason', 'Aucune raison spécifiée');

            // Mettre à jour le statut de l'utilisateur
            $invitation->status = 'rejected';
            $invitation->save();

            // Sauvegarder la raison du rejet dans la table de rejet si elle existe
            try {
                DB::table('rejection_reasons')->insert([
                    'user_id' => $id,
                    'reason' => $reason,
                    'rejected_at' => now()
                ]);
            } catch (\Exception $dbError) {
                Log::warning('Impossible de sauvegarder la raison du rejet: ' . $dbError->getMessage());
                // Continuer même si l'enregistrement de la raison échoue
            }

            // Envoyer un email de rejet (si possible)
            try {
                $this->sendRejectionEmail($invitation, $reason);
            } catch (\Exception $emailError) {
                Log::warning('Erreur lors de l\'envoi du mail de rejet: ' . $emailError->getMessage());
                // Continuer même si l'envoi d'email échoue
            }

            return response()->json([
                'success' => true,
                'message' => 'Invitation rejetée avec succès',
                'data' => [
                    'user' => $invitation,
                    'reason' => $reason
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors du rejet de l\'invitation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rejet de l\'invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Envoie un email d'acceptation à l'utilisateur
     */
    private function sendAcceptanceEmail($user)
    {
        // Cette méthode est un placeholder qui peut être implémentée avec le système d'emails de Laravel
        Log::info('Email d\'acceptation qui serait envoyé à: ' . $user->email);
        
        // Exemple d'implémentation avec Mail façade si la configuration est disponible
        /*
        Mail::send('emails.invitation_accepted', ['user' => $user], function ($message) use ($user) {
            $message->to($user->email, $user->name)
                ->subject('Votre inscription a été acceptée');
        });
        */
    }

    /**
     * Envoie un email de rejet à l'utilisateur
     */
    private function sendRejectionEmail($user, $reason)
    {
        // Cette méthode est un placeholder qui peut être implémentée avec le système d'emails de Laravel
        Log::info('Email de rejet qui serait envoyé à: ' . $user->email . ' avec raison: ' . $reason);
        
        // Exemple d'implémentation avec Mail façade si la configuration est disponible
        /*
        Mail::send('emails.invitation_rejected', ['user' => $user, 'reason' => $reason], function ($message) use ($user) {
            $message->to($user->email, $user->name)
                ->subject('Concernant votre demande d\'inscription');
        });
        */
    }
}
