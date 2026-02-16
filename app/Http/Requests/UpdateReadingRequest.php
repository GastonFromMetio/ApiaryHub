<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReadingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'weight_kg' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:300'],
            'temperature_c' => ['sometimes', 'nullable', 'numeric', 'between:-50,80'],
            'humidity_percent' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
            'activity_index' => ['sometimes', 'nullable', 'integer', 'between:0,100'],
            'recorded_at' => ['sometimes', 'required', 'date'],
        ];
    }
}
