<?php

namespace App\Http\Requests\Prestataire;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PrestationStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Vérifier si l'utilisateur est de type prestataire
        return auth()->check() && auth()->user()->role === 'prestataire';
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
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:15', // durée en minutes
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048', // 2MB max
            'is_available' => 'boolean',
            'location' => 'nullable|string|max:255',
            'can_travel' => 'boolean',
            'travel_radius' => 'required_if:can_travel,true|nullable|integer|min:1|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string|max:100',
            'equipment_required' => 'nullable|string',
            'availability_slots' => 'nullable|array',
            'availability_slots.*.day' => 'required_with:availability_slots|integer|min:0|max:6', // 0=lundi, 6=dimanche
            'availability_slots.*.start_time' => 'required_with:availability_slots|date_format:H:i',
            'availability_slots.*.end_time' => 'required_with:availability_slots|date_format:H:i|after:availability_slots.*.start_time',
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
            'category_id.required' => 'La catégorie est obligatoire.',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'duration.required' => 'La durée est obligatoire.',
            'duration.integer' => 'La durée doit être un nombre entier.',
            'duration.min' => 'La durée minimum est de 15 minutes.',
            'images.*.image' => 'Le fichier doit être une image.',
            'images.*.max' => 'La taille de l\'image ne doit pas dépasser 2Mo.',
            'location.max' => 'L\'emplacement ne peut pas dépasser 255 caractères.',
            'travel_radius.required_if' => 'Le rayon de déplacement est obligatoire si vous pouvez vous déplacer.',
            'travel_radius.integer' => 'Le rayon de déplacement doit être un nombre entier.',
            'travel_radius.min' => 'Le rayon de déplacement minimum est de 1 km.',
            'travel_radius.max' => 'Le rayon de déplacement maximum est de 100 km.',
            'tags.*.string' => 'Les tags doivent être des chaînes de caractères.',
            'tags.*.max' => 'Un tag ne peut pas dépasser 50 caractères.',
            'certifications.*.string' => 'Les certifications doivent être des chaînes de caractères.',
            'certifications.*.max' => 'Une certification ne peut pas dépasser 100 caractères.',
            'availability_slots.*.day.required_with' => 'Le jour est obligatoire pour chaque créneau de disponibilité.',
            'availability_slots.*.day.integer' => 'Le jour doit être un nombre entier.',
            'availability_slots.*.day.min' => 'Le jour doit être entre 0 (lundi) et 6 (dimanche).',
            'availability_slots.*.day.max' => 'Le jour doit être entre 0 (lundi) et 6 (dimanche).',
            'availability_slots.*.start_time.required_with' => 'L\'heure de début est obligatoire pour chaque créneau de disponibilité.',
            'availability_slots.*.start_time.date_format' => 'L\'heure de début doit être au format HH:MM.',
            'availability_slots.*.end_time.required_with' => 'L\'heure de fin est obligatoire pour chaque créneau de disponibilité.',
            'availability_slots.*.end_time.date_format' => 'L\'heure de fin doit être au format HH:MM.',
            'availability_slots.*.end_time.after' => 'L\'heure de fin doit être postérieure à l\'heure de début.',
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
