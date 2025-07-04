<?php

namespace App\Http\Requests\Livreur;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DisponibiliteRequest extends FormRequest
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
        $rules = [
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'ville' => 'required|string|max:100',
            'zone_rayon' => 'required|numeric|min:1|max:100', // rayon en km
            'jours_semaine' => 'required|array',
            'jours_semaine.*' => 'required|integer|between:1,7', // 1=lundi, 7=dimanche
            'capacite' => 'nullable|numeric|min:1',
            'vehicule_type' => 'required|string|in:voiture,camionnette,vélo,scooter,piéton',
            'statut' => 'sometimes|string|in:actif,inactif,pause',
            'notes' => 'nullable|string',
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
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_debut.date' => 'La date de début doit être une date valide.',
            'date_debut.after_or_equal' => 'La date de début doit être aujourd\'hui ou dans le futur.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.date' => 'La date de fin doit être une date valide.',
            'date_fin.after_or_equal' => 'La date de fin doit être égale ou postérieure à la date de début.',
            'heure_debut.required' => 'L\'heure de début est obligatoire.',
            'heure_debut.date_format' => 'L\'heure de début doit être au format HH:MM.',
            'heure_fin.required' => 'L\'heure de fin est obligatoire.',
            'heure_fin.date_format' => 'L\'heure de fin doit être au format HH:MM.',
            'heure_fin.after' => 'L\'heure de fin doit être postérieure à l\'heure de début.',
            'ville.required' => 'La ville est obligatoire.',
            'zone_rayon.required' => 'Le rayon de la zone est obligatoire.',
            'zone_rayon.numeric' => 'Le rayon de la zone doit être un nombre.',
            'zone_rayon.min' => 'Le rayon minimum est de 1 km.',
            'zone_rayon.max' => 'Le rayon maximum est de 100 km.',
            'jours_semaine.required' => 'Les jours de la semaine sont obligatoires.',
            'jours_semaine.array' => 'Les jours de la semaine doivent être un tableau.',
            'jours_semaine.*.between' => 'Les jours doivent être entre 1 (lundi) et 7 (dimanche).',
            'vehicule_type.required' => 'Le type de véhicule est obligatoire.',
            'vehicule_type.in' => 'Le type de véhicule fourni n\'est pas valide.',
            'statut.in' => 'Le statut fourni n\'est pas valide.',
            'capacite.numeric' => 'La capacité doit être un nombre.',
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
