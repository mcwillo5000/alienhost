<?php

use Pterodactyl\Http\Controllers\Admin\AdvertisementController;

Route::group(['prefix' => 'advertisements'], function () {
    Route::get('/', [AdvertisementController::class, 'index'])->name('admin.advertisements.index');
    Route::get('/create', [AdvertisementController::class, 'create'])->name('admin.advertisements.create');
    Route::post('/', [AdvertisementController::class, 'store'])->name('admin.advertisements.store');
    Route::get('/{advertisement}/edit', [AdvertisementController::class, 'edit'])->name('admin.advertisements.edit');
    Route::patch('/{advertisement}', [AdvertisementController::class, 'update'])->name('admin.advertisements.update');
    Route::post('/{advertisement}/send', [AdvertisementController::class, 'send'])->name('admin.advertisements.send');
    Route::delete('/{advertisement}', [AdvertisementController::class, 'destroy'])->name('admin.advertisements.destroy');
});

