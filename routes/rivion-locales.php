<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Api\Client\LocalesController;

Route::group(['middleware' => ['throttle:60,1']], function () {
    Route::get('/locales', [LocalesController::class, 'index'])
        ->name('api.client.locales')
        ->withoutMiddleware(['auth:sanctum']); 
});

Route::get('/locales/{language}/{namespace}.json', function (string $language, string $namespace) {
    if (!preg_match('/^[a-z]{2,3}(-[a-z]{2,3})?$/i', $language)) {
        return response()->json(['error' => 'Invalid language code'], 400);
    }
    if (!preg_match('/^[a-z0-9_-]+$/i', $namespace)) {
        return response()->json(['error' => 'Invalid namespace'], 400);
    }
    
    $filePath = public_path("locales/{$language}/{$namespace}.json");
    
    if (!File::exists($filePath)) {
        $fallbackPath = public_path("locales/en/{$namespace}.json");
        if (!File::exists($fallbackPath)) {
            return response()->json(['error' => 'Translation file not found'], 404);
        }
        $filePath = $fallbackPath;
    }
    
    $content = File::get($filePath);
    $data = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return response()->json(['error' => 'Invalid JSON in translation file'], 500);
    }
    
    return response()->json($data, 200, [
        'Content-Type' => 'application/json',
        'Cache-Control' => 'public, max-age=3600, stale-while-revalidate=86400',
    ]);
})->where([
    'language' => '[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?',
    'namespace' => '[a-zA-Z0-9_-]+'
])->withoutMiddleware(['auth', 'auth:sanctum']);