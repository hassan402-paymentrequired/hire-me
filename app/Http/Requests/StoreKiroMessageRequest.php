<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreKiroMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'messages' => ['required', 'array', 'min:1', 'max:30'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:1000'],
            'provider_slug' => ['nullable', 'string', 'exists:business_profiles,slug'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $messages = $this->input('messages');

                if (is_array($messages) && (end($messages)['role'] ?? null) !== 'user') {
                    $validator->errors()->add('messages', 'The last message must be from the client.');
                }
            },
        ];
    }
}
