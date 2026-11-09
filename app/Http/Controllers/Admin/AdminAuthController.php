<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (auth()->user()?->is_admin) {
            return to_route('admin.dashboard');
        }

        return Inertia::render('Admin/Login');
    }

    public function store(AdminLoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();
        $request->session()->put('admin_last_activity', now()->timestamp);
        $request->user()->forceFill(['last_login_at' => now()])->save();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('admin.login');
    }
}
