<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AnnonceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Vérifier si l'utilisateur est de type client
        return auth()->check() && auth()->user()->role === 'client';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'pickup_address' => 'required|string|max:255',
            'delivery_address' => 'required|string|max:255',
            'pickup_date' => 'required|date|after_or_equal:today',
            'delivery_date' => 'required|date|after_or_equal:pickup_date',
            'weight' => 'required|numeric|min:0|max:100',
            'dimensions' => 'required|string|max:100',
            'tracking_code' => 'nullable|string|max:50',
            'status' => 'sometimes|string|in:draft,active,pending,completed,cancelled',
            'notes' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'nullable|image|max:2048', // 2MB max
            'price' => 'required|numeric|min:0',
        ];
        
        // Si c'est une mise à jour (méthode PUT ou PATCH)
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            // Les champs ne sont plus obligatoires en cas de mise à jour
            $rules = array_map(function ($rule) {
                return str_replace('required', 'sometimes', $rule);
            }, $rules);
        }
        
        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est obligatoire.',
            'description.required' => 'La description est obligatoire.',
            'pickup_address.required' => 'L\'adresse de collecte est obligatoire.',
            'delivery_address.required' => 'L\'adresse de livraison est obligatoire.',
            'pickup_date.required' => 'La date de collecte est obligatoire.',
            'pickup_date.after_or_equal' => 'La date de collecte doit être aujourd\'hui ou dans le futur.',
            'delivery_date.required' => 'La date de livraison est obligatoire.',
            'delivery_date.after_or_equal' => 'La date de livraison doit être égale ou postérieure à la date de collecte.',
            'weight.required' => 'Le poids est obligatoire.',
            'weight.numeric' => 'Le poids doit être une valeur numérique.',
            'weight.max' => 'Le poids maximum autorisé est de 100kg.',
            'dimensions.required' => 'Les dimensions sont obligatoires.',
            'photos.*.image' => 'Le fichier doit être une image.',
            'photos.*.max' => 'La taille de l\'image ne doit pas dépasser 2Mo.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
            'status.in' => 'Le statut fourni n\'est pas valide.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Erreurs de validation',
            'data' => [
                'errors' => $validator->errors()
            ]
        ], 422));
    }
}
