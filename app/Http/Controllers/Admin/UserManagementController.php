<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class UserManagementController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'string', 'in:Employee,Admin,Supervisor'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
        ]);

        User::create([
            ...$validated,
            'password' => Hash::make('password'),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'role' => ['required', 'string', 'in:Employee,Admin,Supervisor'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
        ]);

        $user->update($validated);

        return redirect()->back();
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->back();
    }
}
