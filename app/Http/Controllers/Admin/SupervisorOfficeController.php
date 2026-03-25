<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupervisorOfficeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/supervisor-offices', [
            'offices'     => Office::orderBy('name')->get(['id', 'name', 'supervisor_id']),
            'supervisors' => User::where('role', 'Supervisor')->orderBy('name')->get(['id', 'name', 'email']),
            'assignments' => Office::pluck('supervisor_id', 'id'),
        ]);
    }

    public function assign(Request $request, Office $office): RedirectResponse
    {
        $validated = $request->validate([
            'supervisor_id' => [
                'nullable',
                'integer',
                function ($attribute, $value, $fail) {
                    if ($value !== null && !User::where('id', $value)->where('role', 'Supervisor')->exists()) {
                        $fail('The selected user is not a supervisor.');
                    }
                },
            ],
        ]);

        $office->update(['supervisor_id' => $validated['supervisor_id']]);

        return redirect()->back();
    }
}
