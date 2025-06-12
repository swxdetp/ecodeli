<?php

namespace App\Http\Requests\Commercant;

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
        // Vérifier si l'utilisateur est de type commerçant
        return auth()->check() && auth()->user()->role === 'commercant';
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
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048', // 2MB max
            'quantity' => 'required|integer|min:1',
            'is_available' => 'boolean',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'expiration_date' => 'nullable|date|after_or_equal:today',
            'pickup_address' => 'required|string|max:255',
            'eco_score' => 'nullable|string|in:A,B,C,D,E',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'specifications' => 'nullable|array',
            'specifications.*.key' => 'required_with:specifications|string|max:50',
            'specifications.*.value' => 'required_with:specifications|string|max:255',
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
            'description.required' => 'La description est obligatoire.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas.',
            'images.*.image' => 'Le fichier doit être une image.',
            'images.*.max' => 'La taille de l\'image ne doit pas dépasser 2Mo.',
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.integer' => 'La quantité doit être un nombre entier.',
            'quantity.min' => 'La quantité minimum est de 1.',
            'discount_percent.numeric' => 'La remise doit être une valeur numérique.',
            'discount_percent.min' => 'La remise ne peut pas être négative.',
            'discount_percent.max' => 'La remise ne peut pas dépasser 100%.',
            'expiration_date.date' => 'La date d\'expiration doit être une date valide.',
            'expiration_date.after_or_equal' => 'La date d\'expiration doit être aujourd\'hui ou dans le futur.',
            'pickup_address.required' => 'L\'adresse de collecte est obligatoire.',
            'eco_score.in' => 'Le score écologique doit être entre A et E.',
            'tags.*.string' => 'Les tags doivent être des chaînes de caractères.',
            'tags.*.max' => 'Un tag ne peut pas dépasser 50 caractères.',
            'specifications.*.key.required_with' => 'La clé de spécification est obligatoire.',
            'specifications.*.value.required_with' => 'La valeur de spécification est obligatoire.',
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
