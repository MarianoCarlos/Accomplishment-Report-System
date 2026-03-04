<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Models\Position;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class OfficeManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/office-management', [
            'offices' => Office::orderBy('name')->get(),
            'positions' => Position::orderBy('name')->get(),
            'users' => User::orderBy('name')->get(),
        ]);
    }
}
