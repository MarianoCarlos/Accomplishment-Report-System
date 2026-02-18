<?php

use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportEntryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('user-dashboard', function () {
    return Inertia::render('user/user-dashboard');
})->middleware(['auth', 'verified'])->name('user-dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
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

require __DIR__.'/settings.php';
