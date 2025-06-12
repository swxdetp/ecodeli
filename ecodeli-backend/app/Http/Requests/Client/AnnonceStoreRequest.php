<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AnnonceStoreRequest extends FormRequest
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
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string',
            'price' => 'required|numeric',
            'address_from' => 'required|string',
            'address_to' => 'required|string',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
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
            'title.required' => 'Le titre est obligatoire.',
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'description.required' => 'La description est obligatoire.',
            'type.required' => 'Le type d\'annonce est obligatoire.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
            'address_from.required' => 'L\'adresse de départ est obligatoire.',
            'address_to.required' => 'L\'adresse de destination est obligatoire.',
            'date_from.required' => 'La date de départ est obligatoire.',
            'date_from.date' => 'La date de départ doit être une date valide.',
            'date_to.required' => 'La date d\'arrivée est obligatoire.',
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
