<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SecureAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $timeoutMinutes = (int) config('session.admin_inactivity_timeout', 30);
        $lastActivity = $request->session()->get('admin_last_activity');

        if ($lastActivity && now()->timestamp - (int) $lastActivity >= $timeoutMinutes * 60) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('admin.login')
                ->with('error', 'Your admin session expired due to inactivity. Please sign in again.');
        }

        $request->session()->put('admin_last_activity', now()->timestamp);

        $response = $next($request);

        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}
