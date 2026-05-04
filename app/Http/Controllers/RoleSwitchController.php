<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RoleSwitchController extends Controller
{
    /**
     * Switch the active role of the authenticated user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => ['required', 'string'],
        ]);

        $user = $request->user();
        $requestedRole = $request->input('role');

        if (!in_array($requestedRole, $user->available_roles)) {
            abort(403, 'Unauthorized role switch.');
        }

        session(['active_role' => $requestedRole]);

        return redirect()->route('dashboard');
    }
}
