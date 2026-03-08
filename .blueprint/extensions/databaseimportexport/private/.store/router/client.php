<?php

use Pterodactyl\Http\Middleware\Activity\ServerSubject;
use Pterodactyl\Http\Middleware\Api\Client\Server\ResourceBelongsToServer;
use Pterodactyl\Http\Middleware\Api\Client\Server\AuthenticateServerAccess;
use Illuminate\Support\Facades\Route;
use Pterodactyl\BlueprintFramework\Extensions\databaseimportexport;

Route::group([
	'prefix' => '/{server}',
	'middleware' => [
		ServerSubject::class,
		AuthenticateServerAccess::class,
		ResourceBelongsToServer::class,
	],
], function () {
	Route::get('/', [databaseimportexport\DatabaseController::class, 'index']);

	Route::group(['prefix' => '/{database}'], function () {
		Route::post('/export', [databaseimportexport\DatabaseController::class, 'export']);
		Route::post('/import', [databaseimportexport\DatabaseController::class, 'import']);
		Route::post('/import/remote', [databaseimportexport\DatabaseController::class, 'importRemote']);
	});
});
