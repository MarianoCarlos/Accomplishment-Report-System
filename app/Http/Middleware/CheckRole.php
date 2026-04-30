<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        $activeRole = session('active_role', $user->role);

        // Ensure active role is actually one the user has been assigned
        $userRoles = $user->roles ?? [$user->role];
        if (!in_array($activeRole, $userRoles)) {
            $activeRole = $user->role;
            session(['active_role' => $activeRole]);
        }

        if (in_array($activeRole, $roles)) {
            return $next($request);
        }

        return abort(403, 'Unauthorized access.');
    }
}
