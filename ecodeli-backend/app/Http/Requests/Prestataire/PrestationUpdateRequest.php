<?php

namespace App\Http\Requests\Prestataire;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PrestationUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $prestation = $this->route('prestation');
        return auth()->check() && 
               auth()->user()->role === 'prestataire' && 
               auth()->id() === $prestation->prestataire_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:in_progress,completed',
            'notes' => 'nullable|string',
            'price' => 'sometimes|numeric',
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
            'status.in' => 'Le statut doit être in_progress ou completed.',
            'price.numeric' => 'Le prix doit être une valeur numérique.',
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
            $prestation = $this->route('prestation');
            $status = $this->status;

            if (isset($status)) {
                if ($status === 'in_progress' && $prestation->status !== 'accepted') {
                    $validator->errors()->add(
                        'status', 
                        'La prestation doit être acceptée avant de pouvoir être en cours.'
                    );
                }
                
                if ($status === 'completed' && $prestation->status !== 'in_progress') {
                    $validator->errors()->add(
                        'status', 
                        'La prestation doit être en cours avant de pouvoir être terminée.'
                    );
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
