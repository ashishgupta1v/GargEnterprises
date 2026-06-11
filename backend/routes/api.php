<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Garg Enterprises Phase 1
|--------------------------------------------------------------------------
|
| All routes are prefixed with /v1/ and use JSON responses.
| RBAC is enforced at the controller/policy level.
|
*/

// ── Authentication (Public) ──
Route::prefix('v1/auth')->group(function () {
    Route::post('/send-otp',   [\App\Http\Controllers\Api\V1\AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [\App\Http\Controllers\Api\V1\AuthController::class, 'verifyOtp']);
    Route::post('/refresh',    [\App\Http\Controllers\Api\V1\AuthController::class, 'refresh']);

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout']);
        Route::get('/me',      [\App\Http\Controllers\Api\V1\AuthController::class, 'me']);
    });
});

// ── Authenticated Routes ──
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // ── Module 1: Catalog ──
    Route::prefix('products')->group(function () {
        Route::get('/',               [\App\Http\Controllers\Api\V1\ProductController::class, 'index']);
        Route::get('/search',         [\App\Http\Controllers\Api\V1\ProductController::class, 'search']);
        Route::get('/barcode/{code}', [\App\Http\Controllers\Api\V1\ProductController::class, 'barcodeLookup']);
        Route::get('/{id}',           [\App\Http\Controllers\Api\V1\ProductController::class, 'show']);
        Route::post('/',              [\App\Http\Controllers\Api\V1\ProductController::class, 'store']);
        Route::put('/{id}',           [\App\Http\Controllers\Api\V1\ProductController::class, 'update']);
        Route::delete('/{id}/deactivate', [\App\Http\Controllers\Api\V1\ProductController::class, 'deactivate']);
        Route::post('/import',        [\App\Http\Controllers\Api\V1\ProductController::class, 'import']);
        Route::get('/import/{jobId}/status', [\App\Http\Controllers\Api\V1\ProductController::class, 'importStatus']);
        Route::post('/{id}/photos',   [\App\Http\Controllers\Api\V1\ProductController::class, 'uploadPhoto']);
    });

    Route::get('/categories/tree', [\App\Http\Controllers\Api\V1\CategoryController::class, 'tree']);
    Route::apiResource('/categories', \App\Http\Controllers\Api\V1\CategoryController::class);

    Route::get('/locations/tree', [\App\Http\Controllers\Api\V1\LocationController::class, 'tree']);
    Route::apiResource('/locations', \App\Http\Controllers\Api\V1\LocationController::class);

    Route::apiResource('/brands', \App\Http\Controllers\Api\V1\BrandController::class);

    // ── Module 2: Inventory ──
    Route::prefix('inventory')->group(function () {
        Route::get('/stock',                      [\App\Http\Controllers\Api\V1\InventoryController::class, 'stock']);
        Route::post('/movements',                 [\App\Http\Controllers\Api\V1\MovementController::class, 'store']);
        Route::get('/movements/pending',           [\App\Http\Controllers\Api\V1\MovementController::class, 'pending']);
        Route::post('/movements/{id}/approve',     [\App\Http\Controllers\Api\V1\MovementController::class, 'approve']);
        Route::post('/movements/{id}/reject',      [\App\Http\Controllers\Api\V1\MovementController::class, 'reject']);
        Route::get('/alerts',                      [\App\Http\Controllers\Api\V1\InventoryController::class, 'alerts']);
        Route::get('/reports/{type}',              [\App\Http\Controllers\Api\V1\InventoryController::class, 'report']);
    });

    // ── Dashboard ──
    Route::get('/dashboard/owner', [\App\Http\Controllers\Api\V1\DashboardController::class, 'owner']);

    // ── Mobile Sync ──
    Route::prefix('sync')->group(function () {
        Route::get('/pull',  [\App\Http\Controllers\Api\V1\SyncController::class, 'pull']);
        Route::post('/push', [\App\Http\Controllers\Api\V1\SyncController::class, 'push']);
    });
});
