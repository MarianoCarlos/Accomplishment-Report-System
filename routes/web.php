<?php

use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportEntryController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\Admin\OfficeManagementController;
use App\Http\Controllers\Admin\SupervisorOfficeController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Supervisor\SupervisorController;
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

    if (auth()->user()->role === 'Supervisor') {
        return redirect('/supervisor/dashboard');
    }

    return redirect('/accomplishment-report');
})->middleware(['auth', 'verified'])->name('dashboard');



// Admin Dashboard
Route::get('admin-dashboard', [AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:Admin'])
    ->name('admin-dashboard');

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

// Supervisor Routes
Route::middleware(['auth', 'verified', 'role:Supervisor'])->group(function () {
    Route::get('/supervisor/dashboard', [SupervisorController::class, 'dashboard'])
        ->name('supervisor.dashboard');

    Route::get('/supervisor', [SupervisorController::class, 'index'])
        ->name('supervisor');
});

// Admin Routes - Protected
Route::middleware(['auth', 'verified', 'role:Admin'])->group(function () {
    Route::get('/admin/office-management', [OfficeManagementController::class, 'index'])
        ->name('admin.office-management');

    Route::get('/admin/supervisor-offices', [SupervisorOfficeController::class, 'index'])
        ->name('admin.supervisor-offices');

    Route::patch('/admin/supervisor-offices/{office}/assign', [SupervisorOfficeController::class, 'assign'])
        ->name('admin.supervisor-offices.assign');

    Route::resource('offices', OfficeController::class);

    Route::resource('positions', PositionController::class);

    Route::resource('admin/users', UserManagementController::class);
});

require __DIR__.'/settings.php';

