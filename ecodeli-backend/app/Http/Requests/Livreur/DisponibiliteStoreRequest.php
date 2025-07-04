<?php

namespace App\Http\Requests\Livreur;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DisponibiliteStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Vérifier si l'utilisateur est de type livreur
        return auth()->check() && auth()->user()->role === 'livreur';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'required|string|in:available,busy,away',
            'zone_id' => 'nullable|exists:zones,id',
            'max_deliveries' => 'nullable|integer|min:1',
            'vehicle_type' => 'required|string|in:bike,scooter,car,van',
            'notes' => 'nullable|string',
            'recurring' => 'boolean',
            'recurring_days' => 'required_if:recurring,true|array',
            'recurring_days.*' => 'integer|min:0|max:6', // 0=lundi, 6=dimanche
            'recurring_end_date' => 'required_if:recurring,true|date|after:date',
            'breaks' => 'nullable|array',
            'breaks.*.start_time' => 'required_with:breaks|date_format:H:i',
            'breaks.*.end_time' => 'required_with:breaks|date_format:H:i|after:breaks.*.start_time',
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
            'date.required' => 'La date est obligatoire.',
            'date.date' => 'La date doit être une date valide.',
            'date.after_or_equal' => 'La date doit être aujourd\'hui ou dans le futur.',
            'start_time.required' => 'L\'heure de début est obligatoire.',
            'start_time.date_format' => 'L\'heure de début doit être au format HH:MM.',
            'end_time.required' => 'L\'heure de fin est obligatoire.',
            'end_time.date_format' => 'L\'heure de fin doit être au format HH:MM.',
            'end_time.after' => 'L\'heure de fin doit être postérieure à l\'heure de début.',
            'status.required' => 'Le statut est obligatoire.',
            'status.in' => 'Le statut doit être disponible, occupé ou absent.',
            'zone_id.exists' => 'La zone sélectionnée n\'existe pas.',
            'max_deliveries.integer' => 'Le nombre maximum de livraisons doit être un nombre entier.',
            'max_deliveries.min' => 'Le nombre maximum de livraisons doit être au moins 1.',
            'vehicle_type.required' => 'Le type de véhicule est obligatoire.',
            'vehicle_type.in' => 'Le type de véhicule doit être vélo, scooter, voiture ou camionnette.',
            'recurring.boolean' => 'La récurrence doit être un booléen.',
            'recurring_days.required_if' => 'Les jours de récurrence sont obligatoires si la disponibilité est récurrente.',
            'recurring_days.*.integer' => 'Les jours de récurrence doivent être des nombres entiers.',
            'recurring_days.*.min' => 'Les jours de récurrence doivent être entre 0 (lundi) et 6 (dimanche).',
            'recurring_days.*.max' => 'Les jours de récurrence doivent être entre 0 (lundi) et 6 (dimanche).',
            'recurring_end_date.required_if' => 'La date de fin de récurrence est obligatoire si la disponibilité est récurrente.',
            'recurring_end_date.date' => 'La date de fin de récurrence doit être une date valide.',
            'recurring_end_date.after' => 'La date de fin de récurrence doit être postérieure à la date de début.',
            'breaks.*.start_time.required_with' => 'L\'heure de début de pause est obligatoire.',
            'breaks.*.start_time.date_format' => 'L\'heure de début de pause doit être au format HH:MM.',
            'breaks.*.end_time.required_with' => 'L\'heure de fin de pause est obligatoire.',
            'breaks.*.end_time.date_format' => 'L\'heure de fin de pause doit être au format HH:MM.',
            'breaks.*.end_time.after' => 'L\'heure de fin de pause doit être postérieure à l\'heure de début de pause.',
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
