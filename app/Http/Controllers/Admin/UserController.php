<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::query()
                ->where('is_admin', true)
                ->orderByRaw("FIELD(role, 'super_admin', 'admin', 'editor')")
                ->orderBy('name')
                ->get()
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'isActive' => $user->is_active,
                    'lastLoginAt' => $user->last_login_at?->format('M j, Y \a\t H:i'),
                    'createdAt' => $user->created_at->format('M j, Y'),
                    'isCurrent' => $user->is($request->user()),
                ]),
            'roles' => $this->roles(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'role' => ['required', Rule::in(array_keys($this->roles()))],
            'password' => ['required', 'confirmed', Password::min(6)->letters()->numbers()],
            'is_active' => ['required', 'boolean'],
        ]);

        User::query()->create($validated + [
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        return back()->with('success', "Team member {$validated['name']} created.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->is_admin, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user)],
            'role' => ['required', Rule::in(array_keys($this->roles()))],
            'password' => ['nullable', 'confirmed', Password::min(6)->letters()->numbers()],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($user->is($request->user()) && ($validated['role'] !== $user->role || ! $validated['is_active'])) {
            throw ValidationException::withMessages(['role' => 'You cannot change your own role or deactivate your own account.']);
        }

        if ($user->role === 'super_admin' && ($validated['role'] !== 'super_admin' || ! $validated['is_active'])) {
            $otherOwners = User::query()
                ->where('is_admin', true)
                ->where('is_active', true)
                ->where('role', 'super_admin')
                ->whereKeyNot($user->id)
                ->exists();
            if (! $otherOwners) {
                throw ValidationException::withMessages(['role' => 'At least one active Owner account is required.']);
            }
        }

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', "Team member {$user->name} updated.");
    }

    private function roles(): array
    {
        return [
            'super_admin' => ['label' => 'Owner', 'description' => 'Full access, including user management.'],
            'admin' => ['label' => 'Administrator', 'description' => 'Manage website content, bookings and messages.'],
            'editor' => ['label' => 'Content editor', 'description' => 'Daily content and catalogue management.'],
        ];
    }
}
