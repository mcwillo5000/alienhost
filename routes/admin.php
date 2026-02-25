<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Admin;
use Pterodactyl\Http\Controllers\Admin\AdvancedPermissions\AdvancedPermissionsController;
use Pterodactyl\Http\Controllers\Admin\AdvancedPermissions\ServerGroupController;
use Pterodactyl\Http\Middleware\Admin\Servers\ServerInstalled;

Route::get('/', [Admin\BaseController::class, 'index'])->name('admin.index');

/*
|--------------------------------------------------------------------------
| Location Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/api
|
*/
Route::group(['prefix' => 'api'], function () {
    Route::get('/', [Admin\ApiController::class, 'index'])->name('admin.api.index');
    Route::get('/new', [Admin\ApiController::class, 'create'])->name('admin.api.new');

    Route::post('/new', [Admin\ApiController::class, 'store']);

    Route::delete('/revoke/{identifier}', [Admin\ApiController::class, 'delete'])->name('admin.api.delete');
});

/*
|--------------------------------------------------------------------------
| Location Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/locations
|
*/
Route::group(['prefix' => 'locations'], function () {
    Route::get('/', [Admin\LocationController::class, 'index'])->name('admin.locations');
    Route::get('/view/{location:id}', [Admin\LocationController::class, 'view'])->name('admin.locations.view');

    Route::post('/', [Admin\LocationController::class, 'create']);
    Route::patch('/view/{location:id}', [Admin\LocationController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Database Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/databases
|
*/
Route::group(['prefix' => 'databases'], function () {
    Route::get('/', [Admin\DatabaseController::class, 'index'])->name('admin.databases');
    Route::get('/view/{host:id}', [Admin\DatabaseController::class, 'view'])->name('admin.databases.view');

    Route::post('/', [Admin\DatabaseController::class, 'create']);
    Route::patch('/view/{host:id}', [Admin\DatabaseController::class, 'update']);
    Route::delete('/view/{host:id}', [Admin\DatabaseController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Settings Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/settings
|
*/
Route::group(['prefix' => 'settings'], function () {
    Route::get('/', [Admin\Settings\IndexController::class, 'index'])->name('admin.settings');
    Route::get('/mail', [Admin\Settings\MailController::class, 'index'])->name('admin.settings.mail');
    Route::get('/advanced', [Admin\Settings\AdvancedController::class, 'index'])->name('admin.settings.advanced');

    Route::post('/mail/test', [Admin\Settings\MailController::class, 'test'])->name('admin.settings.mail.test');

    Route::patch('/', [Admin\Settings\IndexController::class, 'update']);
    Route::patch('/mail', [Admin\Settings\MailController::class, 'update']);
    Route::patch('/advanced', [Admin\Settings\AdvancedController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| User Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/users
|
*/
Route::group(['prefix' => 'users'], function () {
    Route::get('/', [Admin\UserController::class, 'index'])->name('admin.users');
    Route::get('/accounts.json', [Admin\UserController::class, 'json'])->name('admin.users.json');
    Route::get('/new', [Admin\UserController::class, 'create'])->name('admin.users.new');
    Route::get('/view/{user:id}', [Admin\UserController::class, 'view'])->name('admin.users.view');

    Route::post('/new', [Admin\UserController::class, 'store']);

    Route::patch('/view/{user:id}', [Admin\UserController::class, 'update']);
    Route::delete('/view/{user:id}', [Admin\UserController::class, 'delete'])->name('admin.users.delete');
});

/*
|--------------------------------------------------------------------------
| Server Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/servers
|
*/
Route::group(['prefix' => 'servers'], function () {
    Route::get('/', [Admin\Servers\ServerController::class, 'index'])->name('admin.servers');
    Route::get('/new', [Admin\Servers\CreateServerController::class, 'index'])->name('admin.servers.new');
    Route::get('/view/{server:id}', [Admin\Servers\ServerViewController::class, 'index'])->name('admin.servers.view');

    Route::group(['middleware' => [ServerInstalled::class]], function () {
        Route::get('/view/{server:id}/details', [Admin\Servers\ServerViewController::class, 'details'])->name('admin.servers.view.details');
        Route::get('/view/{server:id}/build', [Admin\Servers\ServerViewController::class, 'build'])->name('admin.servers.view.build');
        Route::get('/view/{server:id}/startup', [Admin\Servers\ServerViewController::class, 'startup'])->name('admin.servers.view.startup');
        Route::get('/view/{server:id}/database', [Admin\Servers\ServerViewController::class, 'database'])->name('admin.servers.view.database');
        Route::get('/view/{server:id}/mounts', [Admin\Servers\ServerViewController::class, 'mounts'])->name('admin.servers.view.mounts');
    });

    Route::get('/view/{server:id}/manage', [Admin\Servers\ServerViewController::class, 'manage'])->name('admin.servers.view.manage');
    Route::get('/view/{server:id}/delete', [Admin\Servers\ServerViewController::class, 'delete'])->name('admin.servers.view.delete');

    Route::post('/new', [Admin\Servers\CreateServerController::class, 'store']);
    Route::post('/view/{server:id}/build', [Admin\ServersController::class, 'updateBuild']);
    Route::post('/view/{server:id}/startup', [Admin\ServersController::class, 'saveStartup']);
    Route::post('/view/{server:id}/database', [Admin\ServersController::class, 'newDatabase']);
    Route::post('/view/{server:id}/mounts', [Admin\ServersController::class, 'addMount'])->name('admin.servers.view.mounts.store');
    Route::post('/view/{server:id}/manage/toggle', [Admin\ServersController::class, 'toggleInstall'])->name('admin.servers.view.manage.toggle');
    Route::post('/view/{server:id}/manage/suspension', [Admin\ServersController::class, 'manageSuspension'])->name('admin.servers.view.manage.suspension');
    Route::post('/view/{server:id}/manage/reinstall', [Admin\ServersController::class, 'reinstallServer'])->name('admin.servers.view.manage.reinstall');
    Route::post('/view/{server:id}/manage/transfer', [Admin\Servers\ServerTransferController::class, 'transfer'])->name('admin.servers.view.manage.transfer');
    Route::post('/view/{server:id}/delete', [Admin\ServersController::class, 'delete']);

    Route::patch('/view/{server:id}/details', [Admin\ServersController::class, 'setDetails']);
    Route::patch('/view/{server:id}/database', [Admin\ServersController::class, 'resetDatabasePassword']);

    Route::delete('/view/{server:id}/database/{database:id}/delete', [Admin\ServersController::class, 'deleteDatabase'])->name('admin.servers.view.database.delete');
    Route::delete('/view/{server:id}/mounts/{mount:id}', [Admin\ServersController::class, 'deleteMount'])
        ->name('admin.servers.view.mounts.delete');
});

/*
|--------------------------------------------------------------------------
| Node Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/nodes
|
*/
Route::group(['prefix' => 'nodes'], function () {
    Route::get('/', [Admin\Nodes\NodeController::class, 'index'])->name('admin.nodes');
    Route::get('/new', [Admin\NodesController::class, 'create'])->name('admin.nodes.new');
    Route::get('/view/{node:id}', [Admin\Nodes\NodeViewController::class, 'index'])->name('admin.nodes.view');
    Route::get('/view/{node:id}/settings', [Admin\Nodes\NodeViewController::class, 'settings'])->name('admin.nodes.view.settings');
    Route::get('/view/{node:id}/configuration', [Admin\Nodes\NodeViewController::class, 'configuration'])->name('admin.nodes.view.configuration');
    Route::get('/view/{node:id}/allocation', [Admin\Nodes\NodeViewController::class, 'allocations'])->name('admin.nodes.view.allocation');
    Route::get('/view/{node:id}/servers', [Admin\Nodes\NodeViewController::class, 'servers'])->name('admin.nodes.view.servers');
    Route::get('/view/{node:id}/system-information', Admin\Nodes\SystemInformationController::class);

    Route::post('/new', [Admin\NodesController::class, 'store']);
    Route::post('/view/{node:id}/allocation', [Admin\NodesController::class, 'createAllocation']);
    Route::post('/view/{node:id}/allocation/remove', [Admin\NodesController::class, 'allocationRemoveBlock'])->name('admin.nodes.view.allocation.removeBlock');
    Route::post('/view/{node:id}/allocation/alias', [Admin\NodesController::class, 'allocationSetAlias'])->name('admin.nodes.view.allocation.setAlias');
    Route::post('/view/{node:id}/settings/token', Admin\NodeAutoDeployController::class)->name('admin.nodes.view.configuration.token');

    Route::patch('/view/{node:id}/settings', [Admin\NodesController::class, 'updateSettings']);

    Route::delete('/view/{node:id}/delete', [Admin\NodesController::class, 'delete'])->name('admin.nodes.view.delete');
    Route::delete('/view/{node:id}/allocation/remove/{allocation:id}', [Admin\NodesController::class, 'allocationRemoveSingle'])->name('admin.nodes.view.allocation.removeSingle');
    Route::delete('/view/{node:id}/allocations', [Admin\NodesController::class, 'allocationRemoveMultiple'])->name('admin.nodes.view.allocation.removeMultiple');
});

/*
|--------------------------------------------------------------------------
| Mount Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/mounts
|
*/
Route::group(['prefix' => 'mounts'], function () {
    Route::get('/', [Admin\MountController::class, 'index'])->name('admin.mounts');
    Route::get('/view/{mount:id}', [Admin\MountController::class, 'view'])->name('admin.mounts.view');

    Route::post('/', [Admin\MountController::class, 'create']);
    Route::post('/{mount:id}/eggs', [Admin\MountController::class, 'addEggs'])->name('admin.mounts.eggs');
    Route::post('/{mount:id}/nodes', [Admin\MountController::class, 'addNodes'])->name('admin.mounts.nodes');

    Route::patch('/view/{mount:id}', [Admin\MountController::class, 'update']);

    Route::delete('/{mount:id}/eggs/{egg_id}', [Admin\MountController::class, 'deleteEgg']);
    Route::delete('/{mount:id}/nodes/{node_id}', [Admin\MountController::class, 'deleteNode']);
});

/*
|--------------------------------------------------------------------------
| Nest Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/nests
|
*/
Route::group(['prefix' => 'nests'], function () {
    Route::get('/', [Admin\Nests\NestController::class, 'index'])->name('admin.nests');
    Route::get('/new', [Admin\Nests\NestController::class, 'create'])->name('admin.nests.new');
    Route::get('/view/{nest:id}', [Admin\Nests\NestController::class, 'view'])->name('admin.nests.view');
    Route::get('/egg/new', [Admin\Nests\EggController::class, 'create'])->name('admin.nests.egg.new');
    Route::get('/egg/{egg:id}', [Admin\Nests\EggController::class, 'view'])->name('admin.nests.egg.view');
    Route::get('/egg/{egg:id}/export', [Admin\Nests\EggShareController::class, 'export'])->name('admin.nests.egg.export');
    Route::get('/egg/{egg:id}/variables', [Admin\Nests\EggVariableController::class, 'view'])->name('admin.nests.egg.variables');
    Route::get('/egg/{egg:id}/scripts', [Admin\Nests\EggScriptController::class, 'index'])->name('admin.nests.egg.scripts');

    Route::post('/new', [Admin\Nests\NestController::class, 'store']);
    Route::post('/import', [Admin\Nests\EggShareController::class, 'import'])->name('admin.nests.egg.import');
    Route::post('/egg/new', [Admin\Nests\EggController::class, 'store']);
    Route::post('/egg/{egg:id}/variables', [Admin\Nests\EggVariableController::class, 'store']);

    Route::put('/egg/{egg:id}', [Admin\Nests\EggShareController::class, 'update']);

    Route::patch('/view/{nest:id}', [Admin\Nests\NestController::class, 'update']);
    Route::patch('/egg/{egg:id}', [Admin\Nests\EggController::class, 'update']);
    Route::patch('/egg/{egg:id}/scripts', [Admin\Nests\EggScriptController::class, 'update']);
    Route::patch('/egg/{egg:id}/variables/{variable:id}', [Admin\Nests\EggVariableController::class, 'update'])->name('admin.nests.egg.variables.edit');

    Route::delete('/view/{nest:id}', [Admin\Nests\NestController::class, 'destroy']);
    Route::delete('/egg/{egg:id}', [Admin\Nests\EggController::class, 'destroy']);
    Route::delete('/egg/{egg:id}/variables/{variable:id}', [Admin\Nests\EggVariableController::class, 'destroy']);
});
/*
|--------------------------------------------------------------------------
| Velta Studios Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/veltastudios
|
*/
Route::group(['prefix' => 'veltastudios'], function () {
    Route::get('/schedule-templates', [Admin\VeltaStudios\ScheduleTemplateController::class, 'index'])->name('admin.veltastudios.schedule-templates');
    Route::get('/schedule-templates/version', [Admin\VeltaStudios\ScheduleTemplateController::class, 'getVersion'])->name('admin.veltastudios.schedule-templates.version');
    Route::get('/schedule-templates/create', [Admin\VeltaStudios\ScheduleTemplateController::class, 'create'])->name('admin.veltastudios.schedule-templates.create');
    Route::post('/schedule-templates', [Admin\VeltaStudios\ScheduleTemplateController::class, 'store'])->name('admin.veltastudios.schedule-templates.store');
    Route::get('/schedule-templates/{id}/edit', [Admin\VeltaStudios\ScheduleTemplateController::class, 'edit'])->name('admin.veltastudios.schedule-templates.edit');
    Route::patch('/schedule-templates/{id}', [Admin\VeltaStudios\ScheduleTemplateController::class, 'update'])->name('admin.veltastudios.schedule-templates.update');
    Route::delete('/schedule-templates/{id}', [Admin\VeltaStudios\ScheduleTemplateController::class, 'destroy'])->name('admin.veltastudios.schedule-templates.destroy');
});
/*
|--------------------------------------------------------------------------
| SubDomain Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/subdomain
|
*/
Route::group(['prefix' => 'subdomain'], function () {
    Route::get('/', [Admin\SubDomainManagerController::class, 'index'])->name('admin.subdomain');
    Route::get('/new', [Admin\SubDomainManagerController::class, 'new'])->name('admin.subdomain.new');
    Route::get('/edit/{id}', [Admin\SubDomainManagerController::class, 'edit'])->name('admin.subdomain.edit');
    Route::post('/settings', [Admin\SubDomainManagerController::class, 'settings'])->name('admin.subdomain.settings');
    Route::post('/create', [Admin\SubDomainManagerController::class, 'create'])->name('admin.subdomain.create');
    Route::post('/update/{id}', [Admin\SubDomainManagerController::class, 'update'])->name('admin.subdomain.update');
    Route::delete('/delete', [Admin\SubDomainManagerController::class, 'delete'])->name('admin.subdomain.delete');
});
/*
|--------------------------------------------------------------------------
| Game Config Definition Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/game-configs
|
*/
Route::group(['prefix' => 'game-configs'], function () {
    Route::get('/', [Admin\GameConfigDefinitionController::class, 'index'])->name('admin.game-configs');
    Route::get('/list', [Admin\GameConfigDefinitionController::class, 'list'])->name('admin.game-configs.list');
    Route::post('/', [Admin\GameConfigDefinitionController::class, 'store'])->name('admin.game-configs.store');
    Route::get('/{gameConfigDefinition}', [Admin\GameConfigDefinitionController::class, 'show'])->name('admin.game-configs.show');
    Route::patch('/{gameConfigDefinition}', [Admin\GameConfigDefinitionController::class, 'update'])->name('admin.game-configs.update');
    Route::delete('/{gameConfigDefinition}', [Admin\GameConfigDefinitionController::class, 'destroy'])->name('admin.game-configs.destroy');
    Route::post('/{gameConfigDefinition}/files', [Admin\GameConfigDefinitionController::class, 'storeFile'])->name('admin.game-configs.files.store');
    Route::patch('/files/{file}', [Admin\GameConfigDefinitionController::class, 'updateFile'])->name('admin.game-configs.files.update');
    Route::delete('/files/{file}', [Admin\GameConfigDefinitionController::class, 'destroyFile'])->name('admin.game-configs.files.destroy');
});
/*
|--------------------------------------------------------------------------
| Rivion Theme Admin Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/rivion
|
*/
Route::group(['prefix' => 'rivion'], function () {
    Route::get('/', [Admin\RivionController::class, 'index'])->name('admin.rivion');
    Route::get('/eggs', [Admin\RivionController::class, 'eggs'])->name('admin.rivion.eggs');
    Route::get('/dashboard', [Admin\RivionController::class, 'dashboard'])->name('admin.rivion.dashboard');
    Route::get('/announcements', [Admin\RivionController::class, 'announcements'])->name('admin.rivion.announcements');
    Route::get('/backgrounds', [Admin\RivionController::class, 'backgrounds'])->name('admin.rivion.backgrounds');
    Route::get('/language', [Admin\RivionController::class, 'language'])->name('admin.rivion.language');
    Route::get('/settings', [Admin\RivionController::class, 'settings'])->name('admin.rivion.settings');
    Route::get('/metadata', [Admin\RivionController::class, 'metadata'])->name('admin.rivion.metadata');
    Route::post('/', [Admin\RivionController::class, 'update'])->name('admin.rivion.update');
    Route::post('/eggs', [Admin\RivionController::class, 'updateEggs'])->name('admin.rivion.eggs.update');
    Route::post('/dashboard', [Admin\RivionController::class, 'updateDashboard'])->name('admin.rivion.dashboard.update');
    Route::post('/announcements', [Admin\RivionController::class, 'updateAnnouncements'])->name('admin.rivion.announcements.update');
    Route::post('/backgrounds', [Admin\RivionController::class, 'updateBackgrounds'])->name('admin.rivion.backgrounds.update');
    Route::post('/language', [Admin\RivionController::class, 'updateLanguage'])->name('admin.rivion.language.update');
    Route::post('/settings', [Admin\RivionController::class, 'updateSettings'])->name('admin.rivion.settings.update');
    Route::post('/metadata', [Admin\RivionController::class, 'updateMetadata'])->name('admin.rivion.metadata.update');
});
Route::group(['prefix' => 'advertisements'], function () {
    Route::get('/', [Admin\AdvertisementController::class, 'index'])->name('admin.advertisements.index');
    Route::get('/create', [Admin\AdvertisementController::class, 'create'])->name('admin.advertisements.create');
    Route::post('/', [Admin\AdvertisementController::class, 'store'])->name('admin.advertisements.store');
    Route::get('/{advertisement}/edit', [Admin\AdvertisementController::class, 'edit'])->name('admin.advertisements.edit');
    Route::patch('/{advertisement}', [Admin\AdvertisementController::class, 'update'])->name('admin.advertisements.update');
    Route::post('/{advertisement}/send', [Admin\AdvertisementController::class, 'send'])->name('admin.advertisements.send');
    Route::delete('/{advertisement}', [Admin\AdvertisementController::class, 'destroy'])->name('admin.advertisements.destroy');
});
/*
|--------------------------------------------------------------------------
| Automatic phpMyAdmin Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/automatic-phpmyadmin/
|
*/
Route::group(['prefix' => 'automatic-phpmyadmin'], function () {
 Route::get('/', [Admin\AutomaticPhpMyAdminController::class, 'index'])->name('admin.automatic-phpmyadmin');
 Route::get('/new', [Admin\AutomaticPhpMyAdminController::class, 'create'])->name('admin.automatic-phpmyadmin.new');
 Route::get('/view/{automaticphpmyadmin:id}',[Admin\AutomaticPhpMyAdminController::class, 'view'])->name('admin.automatic-phpmyadmin.view');
 Route::post('/new', [Admin\AutomaticPhpMyAdminController::class, 'store']);
 Route::patch('/view/{automaticphpmyadmin:id}',[Admin\AutomaticPhpMyAdminController::class, 'update']);
 Route::delete('/delete/{automaticphpmyadmin:id}',[Admin\AutomaticPhpMyAdminController::class, 'destroy'])->name('admin.automatic-phpmyadmin.delete');
});

Route::group(['prefix' => 'advanced-permissions'], function () {
    Route::get('/', [AdvancedPermissionsController::class, 'index'])
        ->name('admin.advanced-permissions');

    Route::get('/create', [AdvancedPermissionsController::class, 'create'])
        ->name('admin.advanced-permissions.create');

    Route::post('/', [AdvancedPermissionsController::class, 'store'])
        ->name('admin.advanced-permissions.store');

    Route::get('/users/search', [AdvancedPermissionsController::class, 'searchUsers'])
        ->name('admin.advanced-permissions.users.search');

    // ── Server Groups (must be before /{id} wildcard) ─────────────────────────────
    Route::group(['prefix' => 'server-groups'], function () {
        Route::get('/', [ServerGroupController::class, 'index'])
            ->name('admin.advanced-permissions.server-groups');

        Route::get('/create', [ServerGroupController::class, 'create'])
            ->name('admin.advanced-permissions.server-groups.create');

        Route::post('/', [ServerGroupController::class, 'store'])
            ->name('admin.advanced-permissions.server-groups.store');

        Route::get('/{id}/servers/search', [ServerGroupController::class, 'searchServers'])
            ->name('admin.advanced-permissions.server-groups.servers.search');

        Route::get('/{id}', [ServerGroupController::class, 'edit'])
            ->name('admin.advanced-permissions.server-groups.edit');

        Route::patch('/{id}', [ServerGroupController::class, 'update'])
            ->name('admin.advanced-permissions.server-groups.update');

        Route::delete('/{id}', [ServerGroupController::class, 'destroy'])
            ->name('admin.advanced-permissions.server-groups.destroy');

        Route::post('/{id}/servers', [ServerGroupController::class, 'addServer'])
            ->name('admin.advanced-permissions.server-groups.servers.add');

        Route::delete('/{id}/servers/{serverId}', [ServerGroupController::class, 'removeServer'])
            ->name('admin.advanced-permissions.server-groups.servers.remove');
    });

    // ── Role wildcard routes (after all literal prefixes) ───────────────────────
    Route::get('/{id}', [AdvancedPermissionsController::class, 'edit'])
        ->name('admin.advanced-permissions.edit');

    Route::patch('/{id}', [AdvancedPermissionsController::class, 'update'])
        ->name('admin.advanced-permissions.update');

    Route::delete('/{id}', [AdvancedPermissionsController::class, 'destroy'])
        ->name('admin.advanced-permissions.destroy');

    Route::post('/{id}/users', [AdvancedPermissionsController::class, 'assignUser'])
        ->name('admin.advanced-permissions.users.assign');

    Route::delete('/{id}/users/{userId}', [AdvancedPermissionsController::class, 'removeUser'])
        ->name('admin.advanced-permissions.users.remove');
});

include 'admin-serverimporter.php';