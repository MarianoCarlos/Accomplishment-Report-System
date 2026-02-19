<?php

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

Route::get('accomplishment-report', function () {
    return Inertia::render('user/accomplishment-report');
})->middleware(['auth', 'verified'])->name('accomplishment-report');

Route::get('admin-dashboard', function () {
    return Inertia::render('admin/admin-dashboard');
})->middleware(['auth', 'verified'])->name('admin-dashboard');

Route::get('office-management', function () {
    return Inertia::render('admin/office-management');
})->middleware(['auth', 'verified'])->name('office-management');

require __DIR__.'/settings.php';
