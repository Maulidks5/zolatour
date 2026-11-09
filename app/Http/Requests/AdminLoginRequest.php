<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdminLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];
    }

    public function authenticate(): void
    {
        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'The provided login details are incorrect.',
            ]);
        }

        if (! $this->user()?->is_admin || ! $this->user()?->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'This account does not have active admin access.',
            ]);
        }
    }
}
