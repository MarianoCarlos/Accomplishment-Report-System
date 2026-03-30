<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfficeManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = max(5, min(50, (int) $request->integer('per_page', 10)));
        $tab = $request->string('tab', 'office')->toString();

        if (!in_array($tab, ['office', 'positions', 'users'], true)) {
            $tab = 'office';
        }

        return Inertia::render('admin/office-management', [
            'activeTab' => $tab,
            'offices' => Office::orderBy('name')
                ->paginate($perPage, ['*'], 'office_page')
                ->withQueryString(),
            'positions' => Position::orderBy('name')
                ->paginate($perPage, ['*'], 'position_page')
                ->withQueryString(),
            'users' => User::orderBy('name')
                ->paginate($perPage, ['*'], 'user_page')
                ->withQueryString(),
        ]);
    }
}
