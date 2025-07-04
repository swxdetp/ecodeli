<?php

namespace App\Http\Requests\Livreur;

use App\Models\Annonce;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class LivraisonStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'annonce_id' => 'required|exists:annonces,id',
            'notes' => 'nullable|string',
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
            'annonce_id.required' => 'L\'ID de l\'annonce est requis.',
            'annonce_id.exists' => 'L\'annonce sélectionnée n\'existe pas.',
        ];
    }

    /**
     * Configure the validator instance before validation.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Vérifier que l'annonce est disponible
            $annonce = Annonce::find($this->annonce_id);
            
            if ($annonce && $annonce->status !== 'active') {
                $validator->errors()->add('annonce_id', 'Cette annonce n\'est plus disponible.');
            }

            // Vérifier si le livreur a déjà postulé pour cette annonce
            if ($annonce && Auth::user()->livraisons()->where('annonce_id', $annonce->id)->exists()) {
                $validator->errors()->add('annonce_id', 'Vous avez déjà postulé pour cette annonce.');
            }
        });
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
