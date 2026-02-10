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

require __DIR__.'/settings.php';
