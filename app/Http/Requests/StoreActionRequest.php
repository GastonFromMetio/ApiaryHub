<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActionRequest extends FormRequest
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
            'type' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'performed_at' => ['required', 'date'],
        ];
    }
}
