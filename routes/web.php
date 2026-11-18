<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function (Request $request): Response {
        $page = match ($request->user()?->role) {
            'admin' => 'admin/dashboard',
            'manager' => 'manager/dashboard',
            'supervisor' => 'supervisor/dashboard',
            'delivery_staff' => 'driver/dashboard',
            'outside_worker' => 'worker/dashboard',
            default => abort(403),
        };

        return Inertia::render($page);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
