<?php

namespace App\Http\Requests\Livreur;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LivraisonUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $livraison = $this->route('livraison');
        return auth()->check() && 
               auth()->user()->role === 'livreur' && 
               auth()->id() === $livraison->livreur_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:in_progress,delivered',
            'notes' => 'nullable|string',
            'tracking_code' => 'nullable|string',
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
            'status.in' => 'Le statut doit être in_progress ou delivered.',
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
            $livraison = $this->route('livraison');
            $status = $this->status;

            if (isset($status)) {
                if ($status === 'in_progress' && $livraison->status !== 'accepted') {
                    $validator->errors()->add('status', 'La livraison doit être acceptée avant de pouvoir être en cours.');
                }
                
                if ($status === 'delivered' && $livraison->status !== 'in_progress') {
                    $validator->errors()->add('status', 'La livraison doit être en cours avant de pouvoir être livrée.');
                }
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
