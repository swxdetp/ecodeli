<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AnnonceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Vérifier que l'annonce appartient à l'utilisateur connecté
        $annonce = $this->route('annonce');
        return auth()->check() && 
               auth()->user()->role === 'client' && 
               auth()->id() === $annonce->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'type' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'address_from' => 'sometimes|string',
            'address_to' => 'sometimes|string',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after:date_from',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'is_fragile' => 'nullable|boolean',
            'is_urgent' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
            'date_from.date' => 'La date de départ doit être une date valide.',
            'date_to.date' => 'La date d\'arrivée doit être une date valide.',
            'date_to.after' => 'La date d\'arrivée doit être postérieure à la date de départ.',
            'weight.numeric' => 'Le poids doit être une valeur numérique.',
            'is_fragile.boolean' => 'La fragilité doit être un booléen.',
            'is_urgent.boolean' => 'L\'urgence doit être un booléen.',
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
