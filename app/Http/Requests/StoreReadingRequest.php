<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReadingRequest extends FormRequest
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
        $userId = $this->user()?->id;

        return [
            'hive_id' => [
                'required',
                'integer',
                Rule::exists('hives', 'id')->where(fn ($query) => $query->where('user_id', $userId)),
            ],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'temperature_c' => ['nullable', 'numeric', 'between:-50,80'],
            'humidity_percent' => ['nullable', 'numeric', 'between:0,100'],
            'activity_index' => ['nullable', 'integer', 'between:0,100'],
            'recorded_at' => ['required', 'date'],
        ];
    }
}
