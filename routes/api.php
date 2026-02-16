<?php

use App\Http\Controllers\Api\ActionsController;
use App\Http\Controllers\Api\ApiariesController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HivesController;
use App\Http\Controllers\Api\ReadingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/hives', [HivesController::class, 'index']);
    Route::post('/hives', [HivesController::class, 'store']);
    Route::put('/hives/{hive}', [HivesController::class, 'update']);
    Route::delete('/hives/{hive}', [HivesController::class, 'destroy']);
    Route::get('/hives/{hive}/weather', [HivesController::class, 'weather']);

    Route::get('/apiaries', [ApiariesController::class, 'index']);
    Route::post('/apiaries', [ApiariesController::class, 'store']);
    Route::put('/apiaries/{apiary}', [ApiariesController::class, 'update']);
    Route::delete('/apiaries/{apiary}', [ApiariesController::class, 'destroy']);

    Route::get('/readings', [ReadingsController::class, 'index']);
    Route::post('/readings', [ReadingsController::class, 'store']);
    Route::put('/readings/{reading}', [ReadingsController::class, 'update']);
    Route::delete('/readings/{reading}', [ReadingsController::class, 'destroy']);

    Route::get('/actions', [ActionsController::class, 'index']);
    Route::post('/actions', [ActionsController::class, 'store']);
    Route::put('/actions/{action}', [ActionsController::class, 'update']);
    Route::delete('/actions/{action}', [ActionsController::class, 'destroy']);
});
