<?php

use Pterodactyl\Enum\ResourceLimit;
use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Api\Client;
use Pterodactyl\Http\Middleware\Activity\ServerSubject;
use Pterodactyl\Http\Middleware\Activity\AccountSubject;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;
use Pterodactyl\Http\Middleware\Api\Client\Server\ResourceBelongsToServer;
use Pterodactyl\Http\Middleware\Api\Client\Server\AuthenticateServerAccess;

/*
|--------------------------------------------------------------------------
| Client Control API
|--------------------------------------------------------------------------
|
| Endpoint: /api/client
|
*/
Route::get('/', [Client\ClientController::class, 'index'])->name('api:client.index');
Route::get('/permissions', [Client\ClientController::class, 'permissions']);

Route::prefix('/account')->middleware(AccountSubject::class)->group(function () {
    Route::prefix('/')->withoutMiddleware(RequireTwoFactorAuthentication::class)->group(function () {
        Route::get('/', [Client\AccountController::class, 'index'])->name('api:client.account');
        Route::get('/two-factor', [Client\TwoFactorController::class, 'index']);
        Route::post('/two-factor', [Client\TwoFactorController::class, 'store']);
        Route::post('/two-factor/disable', [Client\TwoFactorController::class, 'delete']);
    });

    Route::put('/email', [Client\AccountController::class, 'updateEmail'])->name('api:client.account.update-email');
    Route::put('/password', [Client\AccountController::class, 'updatePassword'])->name('api:client.account.update-password');

    Route::get('/activity', Client\ActivityLogController::class)->name('api:client.account.activity');

    Route::get('/api-keys', [Client\ApiKeyController::class, 'index']);
    Route::post('/api-keys', [Client\ApiKeyController::class, 'store']);
    Route::delete('/api-keys/{identifier}', [Client\ApiKeyController::class, 'delete']);

    Route::prefix('/ssh-keys')->group(function () {
        Route::get('/', [Client\SSHKeyController::class, 'index']);
        Route::post('/', [Client\SSHKeyController::class, 'store']);
        Route::post('/remove', [Client\SSHKeyController::class, 'delete']);
    });
});

/*
|--------------------------------------------------------------------------
| Client Control API
|--------------------------------------------------------------------------
|
| Endpoint: /api/client/servers/{server}
|
*/
Route::group([
    'prefix' => '/servers/{server}',
    'middleware' => [
        ServerSubject::class,
        AuthenticateServerAccess::class,
        ResourceBelongsToServer::class,
    ],
], function () {
    Route::get('/', [Client\Servers\ServerController::class, 'index'])->name('api:client:server.view');
    Route::middleware([ResourceLimit::Websocket->middleware()])
        ->get('/websocket', Client\Servers\WebsocketController::class)
        ->name('api:client:server.ws');
    Route::get('/resources', Client\Servers\ResourceUtilizationController::class)->name('api:client:server.resources');
    Route::get('/activity', Client\Servers\ActivityLogController::class)->name('api:client:server.activity');

    Route::post('/command', [Client\Servers\CommandController::class, 'index']);
    Route::post('/power', [Client\Servers\PowerController::class, 'index']);

    Route::group(['prefix' => '/databases'], function () {
        Route::get('/', [Client\Servers\DatabaseController::class, 'index']);
        Route::middleware([ResourceLimit::Database->middleware()])
            ->post('/', [Client\Servers\DatabaseController::class, 'store']);
        Route::post('/{database}/rotate-password', [Client\Servers\DatabaseController::class, 'rotatePassword']);
        Route::delete('/{database}', [Client\Servers\DatabaseController::class, 'delete']);
    });

    Route::group(['prefix' => '/files'], function () {
        Route::get('/list', [Client\Servers\FileController::class, 'directory']);
        Route::get('/contents', [Client\Servers\FileController::class, 'contents']);
        Route::get('/download', [Client\Servers\FileController::class, 'download']);
        Route::put('/rename', [Client\Servers\FileController::class, 'rename']);
        Route::post('/copy', [Client\Servers\FileController::class, 'copy']);
        Route::post('/write', [Client\Servers\FileController::class, 'write']);
        Route::post('/compress', [Client\Servers\FileController::class, 'compress']);
        Route::post('/decompress', [Client\Servers\FileController::class, 'decompress']);
        Route::post('/delete', [Client\Servers\FileController::class, 'delete']);
        Route::post('/create-folder', [Client\Servers\FileController::class, 'create']);
        Route::post('/chmod', [Client\Servers\FileController::class, 'chmod']);
        Route::middleware([ResourceLimit::FilePull->middleware()])
            ->post('/pull', [Client\Servers\FileController::class, 'pull']);
        Route::post('/restore', [Client\Servers\FileController::class, 'restore']);
        Route::get('/upload', Client\Servers\FileUploadController::class);
    });

    Route::group(['prefix' => '/schedules'], function () {
        Route::get('/', [Client\Servers\ScheduleController::class, 'index']);
        Route::middleware([ResourceLimit::Schedule->middleware()])
            ->post('/', [Client\Servers\ScheduleController::class, 'store']);
        Route::get('/templates', [Client\Servers\ScheduleTemplateController::class, 'index']);
        Route::get('/{schedule}', [Client\Servers\ScheduleController::class, 'view']);
        Route::post('/{schedule}', [Client\Servers\ScheduleController::class, 'update']);
        Route::post('/{schedule}/execute', [Client\Servers\ScheduleController::class, 'execute']);
        Route::delete('/{schedule}', [Client\Servers\ScheduleController::class, 'delete']);

        Route::post('/{schedule}/tasks', [Client\Servers\ScheduleTaskController::class, 'store']);
        Route::post('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'update']);
        Route::delete('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'delete']);
    });

    Route::group(['prefix' => '/network'], function () {
        Route::get('/allocations', [Client\Servers\NetworkAllocationController::class, 'index']);
        Route::middleware([ResourceLimit::Allocation->middleware()])
            ->post('/allocations', [Client\Servers\NetworkAllocationController::class, 'store']);
        Route::post('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'update']);
        Route::post('/allocations/{allocation}/primary', [Client\Servers\NetworkAllocationController::class, 'setPrimary']);
        Route::delete('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'delete']);
    });

    Route::group(['prefix' => '/users'], function () {
        Route::get('/', [Client\Servers\SubuserController::class, 'index']);
        Route::middleware([ResourceLimit::Subuser->middleware()])
            ->post('/', [Client\Servers\SubuserController::class, 'store']);
        Route::get('/{user}', [Client\Servers\SubuserController::class, 'view']);
        Route::post('/{user}', [Client\Servers\SubuserController::class, 'update']);
        Route::delete('/{user}', [Client\Servers\SubuserController::class, 'delete']);
    });

    Route::group(['prefix' => '/backups'], function () {
        Route::get('/', [Client\Servers\BackupController::class, 'index']);
        Route::post('/', [Client\Servers\BackupController::class, 'store']);
        Route::get('/{backup}', [Client\Servers\BackupController::class, 'view']);
        Route::get('/{backup}/download', [Client\Servers\BackupController::class, 'download']);
        Route::post('/{backup}/lock', [Client\Servers\BackupController::class, 'toggleLock']);
        Route::middleware([ResourceLimit::Backup->middleware()])
            ->post('/{backup}/restore', [Client\Servers\BackupController::class, 'restore']);
        Route::delete('/{backup}', [Client\Servers\BackupController::class, 'delete']);
    });

    Route::group(['prefix' => '/startup'], function () {
        Route::get('/', [Client\Servers\StartupController::class, 'index']);
        Route::put('/variable', [Client\Servers\StartupController::class, 'update']);
    });
    Route::group(['prefix' => '/mods'], function () {
        Route::get('/', [Client\Servers\MinecraftModInstallerController::class, 'index']);
        Route::get('/minecraft-versions', [Client\Servers\MinecraftModInstallerController::class, 'getMinecraftVersions']);
        Route::get('/loaders', [Client\Servers\MinecraftModInstallerController::class, 'getModLoaders']);
        Route::get('/installed', [Client\Servers\MinecraftModInstallerController::class, 'getInstalledModsVersions']);
        Route::get('/installed-mods', [Client\Servers\MinecraftModInstallerController::class, 'getInstalledMods']);
        Route::delete('/remove/{modId}', [Client\Servers\MinecraftModInstallerController::class, 'removeMod']);
        Route::get('/{modId}/versions', [Client\Servers\MinecraftModInstallerController::class, 'versions']);
        Route::post('/install', [Client\Servers\MinecraftModInstallerController::class, 'install']);
    });
    Route::group(['prefix' => '/settings'], function () {
        Route::post('/rename', [Client\Servers\SettingsController::class, 'rename']);
        Route::post('/crashlogs', [Client\Servers\SettingsController::class, 'crashlogs']);
        Route::post('/reinstall', [Client\Servers\SettingsController::class, 'reinstall']);
        Route::put('/docker-image', [Client\Servers\SettingsController::class, 'dockerImage']);
    });
        Route::group(['prefix' => '/hytale-mods'], function () {
        Route::get('/', [Client\Servers\HytaleModInstallerController::class, 'index']);
        Route::get('/hytale-versions', [Client\Servers\HytaleModInstallerController::class, 'getHytaleVersions']);
        Route::get('/installed', [Client\Servers\HytaleModInstallerController::class, 'getInstalledModsVersions']);
        Route::get('/installed-mods', [Client\Servers\HytaleModInstallerController::class, 'getInstalledMods']);
        Route::get('/{modId}/versions', [Client\Servers\HytaleModInstallerController::class, 'versions']);
        Route::post('/install', [Client\Servers\HytaleModInstallerController::class, 'install']);
        Route::delete('/remove/{modId}', [Client\Servers\HytaleModInstallerController::class, 'removeMod']);
    });
        Route::group(['prefix' => '/hytale-worlds'], function () {
        Route::get('/', [Client\Servers\HytaleWorldInstallerController::class, 'index']);
        Route::get('/hytale-versions', [Client\Servers\HytaleWorldInstallerController::class, 'getHytaleVersions']);
        Route::get('/installed', [Client\Servers\HytaleWorldInstallerController::class, 'getInstalledWorldsVersions']);
        Route::get('/{worldId}/versions', [Client\Servers\HytaleWorldInstallerController::class, 'versions']);
        Route::post('/install', [Client\Servers\HytaleWorldInstallerController::class, 'install']);
        Route::get('/download-status/{downloadId}', [Client\Servers\HytaleWorldInstallerController::class, 'downloadStatus']);
    });
        Route::group(['prefix' => '/hytale-prefabs'], function () {
        Route::get('/', [Client\Servers\HytalePrefabsInstallerController::class, 'index']);
        Route::get('/hytale-versions', [Client\Servers\HytalePrefabsInstallerController::class, 'getHytaleVersions']);
        Route::get('/installed', [Client\Servers\HytalePrefabsInstallerController::class, 'getInstalledPrefabsVersions']);
        Route::get('/installed-prefabs', [Client\Servers\HytalePrefabsInstallerController::class, 'getInstalledPrefabs']);
        Route::delete('/remove/{prefabId}', [Client\Servers\HytalePrefabsInstallerController::class, 'removePrefab']);
        Route::get('/{prefabId}/versions', [Client\Servers\HytalePrefabsInstallerController::class, 'versions']);
        Route::post('/install', [Client\Servers\HytalePrefabsInstallerController::class, 'install']);
    });
        Route::group(['prefix' => '/hytale'], function () {
        Route::get('/settings', [Client\Servers\HytaleSettingsController::class, 'index']);
        Route::post('/settings', [Client\Servers\HytaleSettingsController::class, 'update']);
        Route::get('/worlds', [Client\Servers\HytaleWorldsController::class, 'index']);
        Route::get('/worlds/{world}', [Client\Servers\HytaleWorldsController::class, 'show']);
        Route::post('/worlds/{world}', [Client\Servers\HytaleWorldsController::class, 'update']);
    });
    Route::group(['prefix' => '/hytale-players'], function () {
        Route::get('/', [Client\Servers\HytalePlayerManagerController::class, 'getAllData']);
        Route::get('/permissions', [Client\Servers\HytalePlayerManagerController::class, 'getPermissions']);
        Route::post('/permissions', [Client\Servers\HytalePlayerManagerController::class, 'updatePermissions']);
        Route::post('/permissions/group', [Client\Servers\HytalePlayerManagerController::class, 'createGroup']);
        Route::put('/permissions/group', [Client\Servers\HytalePlayerManagerController::class, 'updateGroup']);
        Route::delete('/permissions/group', [Client\Servers\HytalePlayerManagerController::class, 'deleteGroup']);
        Route::post('/permissions/player', [Client\Servers\HytalePlayerManagerController::class, 'addPlayerToGroup']);
        Route::delete('/permissions/player', [Client\Servers\HytalePlayerManagerController::class, 'removePlayerFromGroup']);
        Route::get('/whitelist', [Client\Servers\HytalePlayerManagerController::class, 'getWhitelist']);
        Route::post('/whitelist/toggle', [Client\Servers\HytalePlayerManagerController::class, 'toggleWhitelist']);
        Route::post('/whitelist/player', [Client\Servers\HytalePlayerManagerController::class, 'addToWhitelist']);
        Route::delete('/whitelist/player', [Client\Servers\HytalePlayerManagerController::class, 'removeFromWhitelist']);
        Route::get('/bans', [Client\Servers\HytalePlayerManagerController::class, 'getBans']);
        Route::post('/bans', [Client\Servers\HytalePlayerManagerController::class, 'addBan']);
        Route::delete('/bans', [Client\Servers\HytalePlayerManagerController::class, 'removeBan']);
        Route::get('/players', [Client\Servers\HytalePlayerManagerController::class, 'getPlayers']);
        Route::delete('/players', [Client\Servers\HytalePlayerManagerController::class, 'deletePlayer']);
        Route::post('/players/gamemode', [Client\Servers\HytalePlayerManagerController::class, 'changePlayerGamemode']);
    });
        Route::group(['prefix' => '/minecraft-modpacks'], function () {
        Route::get('/', [Client\Servers\ModpackController::class, 'index']);
        Route::get('/versions', [Client\Servers\ModpackController::class, 'versions']);
        Route::post('/install', [Client\Servers\ModpackController::class, 'install']);
    });
        Route::get('/minecraft-software', [Client\Servers\MinecraftSoftwareController::class,'index']);
        Route::group(['prefix' => '/minecraft-plugins'], function () {
        Route::get('/', [Client\Servers\MinecraftPluginController::class, 'index']);
        Route::get('/versions', [Client\Servers\MinecraftPluginController::class, 'versions']);
        Route::post('/install', [Client\Servers\MinecraftPluginController::class,'installPlugin']);
        Route::get('/installed', [Client\Servers\MinecraftPluginController::class,'getInstalledPluginsVersions']);
        Route::get('/is-linked', [Client\Servers\MinecraftPluginController::class, 'isLinked']);
        Route::post('/link', [Client\Servers\MinecraftPluginController::class, 'linkPolymart'])->name('minecraft-plugins.link');
        Route::post('/link-back', [Client\Servers\MinecraftPluginController::class,'handleBackPolymart'])->name('minecraft-plugins.link-back')->withoutMiddleware([\Pterodactyl\Http\Middleware\VerifyCsrfToken::class, ServerSubject::class,'auth', 'api', \Pterodactyl\Http\Middleware\Api\Client\RequireClientApiKey::class,AuthenticateServerAccess::class]);
        Route::post('/disconnect', [Client\Servers\MinecraftPluginController::class,'disconnectPolymart']);
    });
        Route::group(['prefix' => '/subdomain'], function () {
        Route::get('/', [Client\Servers\SubdomainManagerController::class, 'index']);
        Route::post('/create', [Client\Servers\SubdomainManagerController::class, 'create']);
        Route::post('/sync/{subdomainId}', [Client\Servers\SubdomainManagerController::class, 'sync']);
        Route::delete('/{subdomainId}', [Client\Servers\SubdomainManagerController::class, 'delete']);
    });
        Route::group(['prefix' => '/game-config'], function () {
        Route::get('/detect', [Client\Servers\GameConfigController::class, 'detectGameType']);
        Route::get('/files', [Client\Servers\GameConfigController::class, 'getConfigFiles']);
        Route::get('/content', [Client\Servers\GameConfigController::class, 'getConfig']);
        Route::post('/update', [Client\Servers\GameConfigController::class, 'updateConfig']);
    });
    Route::group(['prefix' => '/players'], function () {
        Route::get('/fast-query', [Client\Servers\MCPManager\MCPQueryController::class, 'index']);
        Route::post('/check-autosave', [Client\Servers\MCPManager\MCPQueryController::class, 'checkAutosave']);
        Route::get('/server-type', [Client\Servers\MCPManager\MCPQueryController::class, 'getServerType']);
        Route::get('/advancements-wiki', [Client\Servers\MCPManager\MCPQueryController::class, 'getAdvancementsFromWiki']);
        Route::get('/worlds', [Client\Servers\MCPManager\MCPQueryController::class, 'getDetectedWorlds']);
        Route::post('/action', [Client\Servers\MCPManager\MCPQueryController::class, 'performAction']);
        Route::post('/kick', [Client\Servers\MCPManager\MCPQueryController::class, 'kickPlayer']);
        Route::prefix('/{uuid}')->group(function () {
            Route::get('/advancements', [Client\Servers\MCPManager\MCPQueryController::class, 'getPlayerAdvancements']);
            Route::get('/items', [Client\Servers\MCPManager\MCPQueryController::class, 'getPlayerItems']);
            Route::post('/stats', [Client\Servers\MCPManager\MCPQueryController::class, 'updatePlayerStats']);
            Route::post('/whitelist', [Client\Servers\MCPManager\MCPQueryController::class, 'whitelistPlayer']);
            Route::delete('/whitelist', [Client\Servers\MCPManager\MCPQueryController::class, 'unwhitelistPlayer']);
            Route::post('/ban', [Client\Servers\MCPManager\MCPQueryController::class, 'banPlayer']);
            Route::delete('/ban', [Client\Servers\MCPManager\MCPQueryController::class, 'unbanPlayer']);
            Route::post('/op', [Client\Servers\MCPManager\MCPQueryController::class, 'opPlayer']);
            Route::delete('/op', [Client\Servers\MCPManager\MCPQueryController::class, 'deopPlayer']);
            Route::post('/clear-inventory', [Client\Servers\MCPManager\MCPQueryController::class, 'clearInventory']);
            Route::delete('/wipe-data', [Client\Servers\MCPManager\MCPQueryController::class, 'wipePlayerData']);
            Route::post('/gamemode', [Client\Servers\MCPManager\MCPQueryController::class, 'changeGamemode']);
            Route::post('/ban-ip', [Client\Servers\MCPManager\MCPQueryController::class, 'banIp']);
            Route::delete('/ban-ip', [Client\Servers\MCPManager\MCPQueryController::class, 'unbanIp']);
            Route::post('/give-item', [Client\Servers\MCPManager\MCPQueryController::class, 'giveItem']);
            Route::post('/add-effect', [Client\Servers\MCPManager\MCPQueryController::class, 'addEffect']);
            Route::post('/clear-effect', [Client\Servers\MCPManager\MCPQueryController::class, 'clearEffect']);
            Route::post('/modify-stat', [Client\Servers\MCPManager\MCPQueryController::class, 'modifyPlayerStat']);
        });
    });
});
/*
|--------------------------------------------------------------------------
| Rivion Theme - Dynamic Locales Detection
|--------------------------------------------------------------------------
*/
if (file_exists(base_path('routes/rivion-locales.php'))) {
    require base_path('routes/rivion-locales.php');
}
Route::prefix('/extensions/serverimporter')->group(base_path('routes/client-serverimporter.php'));