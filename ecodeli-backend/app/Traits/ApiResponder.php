<?php

namespace App\Traits;

trait ApiResponder
{
    /**
     * Retourne une réponse JSON de succès
     *
     * @param mixed $data Les données à retourner
     * @param string|null $message Message explicatif (optionnel)
     * @param int $code Code HTTP
     * @return \Illuminate\Http\JsonResponse
     */
    protected function successResponse($data, string $message = null, int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Retourne une réponse JSON d'erreur
     *
     * @param string $message Message d'erreur
     * @param int $code Code HTTP
     * @param mixed $data Données additionnelles (optionnel)
     * @return \Illuminate\Http\JsonResponse
     */
    protected function errorResponse(string $message, int $code = 400, $data = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Retourne une réponse de création (201)
     *
     * @param mixed $data Les données créées
     * @param string|null $message Message explicatif
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createdResponse($data, string $message = 'Ressource créée avec succès')
    {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Retourne une réponse de mise à jour (200)
     *
     * @param mixed $data Les données mises à jour
     * @param string|null $message Message explicatif
     * @return \Illuminate\Http\JsonResponse
     */
    protected function updatedResponse($data, string $message = 'Ressource mise à jour avec succès')
    {
        return $this->successResponse($data, $message);
    }

    /**
     * Retourne une réponse de suppression (204)
     *
     * @param string|null $message Message explicatif
     * @return \Illuminate\Http\JsonResponse
     */
    protected function deletedResponse(string $message = 'Ressource supprimée avec succès')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 204);
    }

    /**
     * Retourne une réponse pour validation échouée (422)
     *
     * @param mixed $errors Les erreurs de validation
     * @param string|null $message Message explicatif
     * @return \Illuminate\Http\JsonResponse
     */
    protected function validationErrorResponse($errors, string $message = 'Erreurs de validation')
    {
        return $this->errorResponse($message, 422, ['errors' => $errors]);
    }
    
    /**
     * Retourne une réponse pour ressource non trouvée (404)
     *
     * @param string $message Message explicatif
     * @param mixed $data Données additionnelles (optionnel)
     * @return \Illuminate\Http\JsonResponse
     */
    protected function notFoundResponse(string $message = 'Ressource non trouvée', $data = null)
    {
        return $this->errorResponse($message, 404, $data);
    }
    
    /**
     * Retourne une réponse pour accès non autorisé (403)
     *
     * @param string $message Message explicatif
     * @param mixed $data Données additionnelles (optionnel)
     * @return \Illuminate\Http\JsonResponse
     */
    protected function forbiddenResponse(string $message = 'Accès non autorisé', $data = null)
    {
        return $this->errorResponse($message, 403, $data);
    }
    
    /**
     * Retourne une réponse pour authentification requise (401)
     *
     * @param string $message Message explicatif
     * @param mixed $data Données additionnelles (optionnel)
     * @return \Illuminate\Http\JsonResponse
     */
    protected function unauthorizedResponse(string $message = 'Authentification requise', $data = null)
    {
        return $this->errorResponse($message, 401, $data);
    }
}
