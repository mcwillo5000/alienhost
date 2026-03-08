<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Admin;

Route::group(['prefix' => 'extensions/databaseimportexport'], function () {
	Route::get('/', [Admin\Extensions\databaseimportexport\databaseimportexportExtensionController::class, 'index'])->name('admin.extensions.databaseimportexport.index');
	Route::patch('/', [Admin\Extensions\databaseimportexport\databaseimportexportExtensionController::class, 'update'])->name('admin.extensions.databaseimportexport.patch');
	Route::post('/', [Admin\Extensions\databaseimportexport\databaseimportexportExtensionController::class, 'post'])->name('admin.extensions.databaseimportexport.post');
	Route::put('/', [Admin\Extensions\databaseimportexport\databaseimportexportExtensionController::class, 'put'])->name('admin.extensions.databaseimportexport.put');
	Route::delete('/{target}/{id}', [Admin\Extensions\databaseimportexport\databaseimportexportExtensionController::class, 'delete'])->name('admin.extensions.databaseimportexport.delete');
});