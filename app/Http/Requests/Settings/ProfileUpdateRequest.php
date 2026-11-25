<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Genders a user can pick on their profile.
     *
     * @var list<string>
     */
    public const GENDERS = ['female', 'male', 'other', 'prefer_not_to_say'];

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required_without:first_name', 'nullable', 'string', 'max:255'],
            'first_name' => ['required_without:name', 'nullable', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-()]{7,30}$/'],
            'gender' => ['sometimes', 'nullable', Rule::in(self::GENDERS)],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today', 'after:1900-01-01'],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid phone number.',
            'first_name.required_without' => 'Enter your first name.',
        ];
    }

    /**
     * The profile fields to save on the user, with first and last name joined.
     *
     * @return array<string, mixed>
     */
    public function profileAttributes(): array
    {
        $attributes = $this->safe()->only(['email', 'phone', 'gender', 'date_of_birth']);

        $attributes['name'] = $this->filled('first_name')
            ? trim($this->string('first_name').' '.$this->string('last_name'))
            : $this->string('name')->toString();

        return $attributes;
    }
}
