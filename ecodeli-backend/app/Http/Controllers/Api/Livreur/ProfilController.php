<?php

namespace App\Http\Controllers\Api\Livreur;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfilController extends Controller
{
    use ApiResponder;
    /**
     * Display the livreur's profile.
     */
    public function show()
    {
        $user = Auth::user();
        
        // Ne pas renvoyer de données sensibles
        $userData = $user->only(['id', 'name', 'email', 'phone', 'profile_picture', 'id_document', 'address']);
        
        // Récupérer le document d'identité le plus récent de l'utilisateur
        $identityDocument = $user->identityDocuments()->latest()->first();
        
        if ($identityDocument) {
            // Extraire juste le nom du fichier depuis le chemin complet
            $filePath = $identityDocument->file_path;
            $fileName = basename($filePath);
            
            // Ajouter ou mettre à jour le champ id_document avec le nom du fichier
            $userData['id_document'] = $fileName;
        }
        
        return $this->successResponse($userData, 'Profil livreur récupéré avec succès');
    }

    /**
     * Update the livreur's profile.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . Auth::id(),
            'phone' => 'sometimes|string|max:20',
            'password' => 'sometimes|string|min:8|confirmed',
            'address' => 'sometimes|string|max:255',
            'profile_picture' => 'sometimes|image|max:2048', // 2MB max
        ]);
        
        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }
        
        $user = Auth::user();
        
        // Mettre à jour les champs de base
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        
        if ($request->has('address')) {
            $user->address = $request->address;
        }
        
        if ($request->has('password') && $request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        
        // Gérer l'upload de photo de profil
        if ($request->hasFile('profile_picture')) {
            // Supprimer l'ancienne photo si elle existe
            if ($user->profile_picture) {
                Storage::delete('public/profiles/' . $user->profile_picture);
            }
            
            $filename = time() . '_' . $request->file('profile_picture')->getClientOriginalName();
            $request->file('profile_picture')->storeAs('public/profiles', $filename);
            $user->profile_picture = $filename;
        }
        
        $user->save();
        
        return $this->successResponse($user->only(['id', 'name', 'email', 'phone', 'address', 'profile_picture']), 'Profil mis à jour avec succès');
    }
    
    /**
     * Upload documents (pièce d'identité, etc.)
     */
    public function uploadDocuments(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_document' => 'required|file|max:5120', // 5MB max
        ]);
        
        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }
        
        $user = Auth::user();
        
        // Supprimer l'ancien document si existant
        if ($user->id_document) {
            Storage::delete('public/documents/' . $user->id_document);
        }
        
        // Sauvegarder le nouveau document
        $filename = time() . '_' . $request->file('id_document')->getClientOriginalName();
        $request->file('id_document')->storeAs('public/documents', $filename);
        $user->id_document = $filename;
        $user->save();
        
        return $this->successResponse(['document' => $filename], 'Document uploadé avec succès');
    }
}
