<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\Position;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        // Summary counts
        $stats = [
            'totalEmployees'  => User::where('role', 'Employee')->count(),
            'totalSupervisors' => User::where('role', 'Supervisor')->count(),
            'totalOffices'    => Office::count(),
            'totalPositions'  => Position::count(),
        ];

        // Recent activity — last 5 of each
        $recentUsers = User::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $recentOffices = Office::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'created_at']);

        $recentPositions = Position::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'created_at']);

        // Office overview: each office with member count + supervisor name
        $officeOverview = Office::withCount('members')
            ->with('supervisor:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'supervisor_id']);

        return Inertia::render('admin/admin-dashboard', [
            'stats'          => $stats,
            'recentUsers'    => $recentUsers,
            'recentOffices'  => $recentOffices,
            'recentPositions' => $recentPositions,
            'officeOverview' => $officeOverview,
        ]);
    }
}
