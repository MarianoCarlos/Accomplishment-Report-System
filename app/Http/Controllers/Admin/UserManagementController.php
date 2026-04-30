<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class UserManagementController extends Controller
{
    /**
     * Derive the primary role from a list of roles by priority: Admin > Supervisor > Employee.
     */
    private function derivePrimaryRole(array $roles): string
    {
        if (in_array('Admin', $roles)) return 'Admin';
        if (in_array('Supervisor', $roles)) return 'Supervisor';
        return 'Employee';
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'roles'       => ['required', 'array', 'min:1'],
            'roles.*'     => ['string', 'in:Employee,Admin,Supervisor'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'office_id'   => ['nullable', 'integer', 'exists:offices,id'],
        ]);

        $roles = $validated['roles'];
        $primaryRole = $this->derivePrimaryRole($roles);

        User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'role'        => $primaryRole,
            'roles'       => $roles,
            'position_id' => $validated['position_id'] ?? null,
            'office_id'   => $validated['office_id'] ?? null,
            'password'    => Hash::make('password'),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email,' . $user->id],
            'roles'       => ['required', 'array', 'min:1'],
            'roles.*'     => ['string', 'in:Employee,Admin,Supervisor'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'office_id'   => ['nullable', 'integer', 'exists:offices,id'],
        ]);

        $roles = $validated['roles'];
        $primaryRole = $this->derivePrimaryRole($roles);

        $user->update([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'role'        => $primaryRole,
            'roles'       => $roles,
            'position_id' => $validated['position_id'] ?? null,
            'office_id'   => $validated['office_id'] ?? null,
        ]);

        return redirect()->back();
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->back();
    }
}
