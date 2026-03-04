<?php

use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportEntryController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\Admin\OfficeManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Fallback dashboard that redirects based on role
Route::get('dashboard', function () {
    if (auth()->user()->role === 'Admin') {
        return redirect('/admin-dashboard');
    }
    return redirect('/user-dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// User/Employee Dashboard
Route::get('user-dashboard', function () {
    return Inertia::render('user/user-dashboard');
})->middleware(['auth', 'verified', 'role:Employee'])->name('user-dashboard');

// Admin Dashboard
Route::get('admin-dashboard', function () {
    return Inertia::render('admin/admin-dashboard');
})->middleware(['auth', 'verified', 'role:Admin'])->name('admin-dashboard');

// Employee Report Routes
Route::middleware(['auth', 'verified', 'role:Employee'])->group(function () {
    Route::get('/accomplishment-report', [ReportController::class, 'index'])
        ->name('accomplishment-report');

    Route::post('/reports', [ReportController::class, 'store'])
        ->name('reports.store');

    Route::patch('/reports/{report}/archive', [ReportController::class, 'archive'])
        ->name('reports.archive');

    Route::patch('/reports/{report}/restore', [ReportController::class, 'restore'])
        ->name('reports.restore');

    Route::delete('/reports/{report}', [ReportController::class, 'destroy'])
        ->name('reports.destroy');

    Route::patch('/reports/{report}/print-details', [ReportController::class, 'updatePrintDetails'])
        ->name('reports.print-details');

    Route::patch('/report-entries/{entry}', [ReportEntryController::class, 'update'])
        ->name('report-entries.update');
});

// Admin Routes - Protected
Route::middleware(['auth', 'verified', 'role:Admin'])->group(function () {
    Route::get('/admin/office-management', [OfficeManagementController::class, 'index'])
        ->name('admin.office-management');

    Route::resource('offices', OfficeController::class);

    Route::resource('positions', PositionController::class);

    Route::resource('admin/users', UserManagementController::class);
});

require __DIR__.'/settings.php';

