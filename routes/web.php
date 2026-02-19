<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/reset-password/{token}', function () {
    return view('app');
})->name('password.reset');
