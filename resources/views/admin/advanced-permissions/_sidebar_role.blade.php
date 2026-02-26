
@php
    $hasAccess = function (string $prefix) use ($role): bool {
        if (!$role) return false;
        return $role->canAccessRoute($prefix);
    };
@endphp



<li class="header">BASIC ADMINISTRATION</li>

<li class="{{ Route::currentRouteName() === 'admin.index' ? 'active' : '' }}">
    <a href="{{ route('admin.index') }}">
        <i class="fa fa-home"></i> <span>Overview</span>
    </a>
</li>

@if ($hasAccess('admin.settings'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.settings') ? 'active' : '' }}">
        <a href="{{ route('admin.settings') }}">
            <i class="fa fa-wrench"></i> <span>Settings</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.api'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.api') ? 'active' : '' }}">
        <a href="{{ route('admin.api.index') }}">
            <i class="fa fa-gamepad"></i> <span>Application API</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.rivion'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.rivion') ? 'active' : '' }}">
        <a href="{{ route('admin.rivion') }}">
            <i class="fa fa-paint-brush"></i> <span>Rivion Theme</span>
        </a>
    </li>
@endif



@if ($hasAccess('admin.databases') || $hasAccess('admin.locations') || $hasAccess('admin.nodes') || $hasAccess('admin.servers') || $hasAccess('admin.users'))
    <li class="header">MANAGEMENT</li>
@endif

@if ($hasAccess('admin.databases'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.databases') ? 'active' : '' }}">
        <a href="{{ route('admin.databases') }}">
            <i class="fa fa-database"></i> <span>Databases</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.locations'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.locations') ? 'active' : '' }}">
        <a href="{{ route('admin.locations') }}">
            <i class="fa fa-globe"></i> <span>Locations</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.nodes'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.nodes') ? 'active' : '' }}">
        <a href="{{ route('admin.nodes') }}">
            <i class="fa fa-sitemap"></i> <span>Nodes</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.servers'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.servers') ? 'active' : '' }}">
        <a href="{{ route('admin.servers') }}">
            <i class="fa fa-server"></i> <span>Servers</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.users'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.users') ? 'active' : '' }}">
        <a href="{{ route('admin.users') }}">
            <i class="fa fa-users"></i> <span>Users</span>
        </a>
    </li>
@endif



@if ($hasAccess('admin.mounts') || $hasAccess('admin.nests'))
    <li class="header">SERVICE MANAGEMENT</li>
@endif

@if ($hasAccess('admin.mounts'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.mounts') ? 'active' : '' }}">
        <a href="{{ route('admin.mounts') }}">
            <i class="fa fa-magic"></i> <span>Mounts</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.nests'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.nests') ? 'active' : '' }}">
        <a href="{{ route('admin.nests') }}">
            <i class="fa fa-th-large"></i> <span>Nests</span>
        </a>
    </li>
@endif



@if ($hasAccess('admin.veltastudios') || $hasAccess('admin.subdomain') || $hasAccess('admin.game-configs') || $hasAccess('admin.advertisements') || $hasAccess('admin.automatic-phpmyadmin') || $hasAccess('admin.extensions.serverimporter') || $hasAccess('admin.advanced-permissions'))
    <li class="header">ADDONS</li>
@endif

@if ($hasAccess('admin.veltastudios'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.veltastudios') ? 'active' : '' }}">
        <a href="{{ route('admin.veltastudios.schedule-templates') }}">
            <i class="fa fa-calendar"></i> <span>Schedule Template Manager</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.subdomain'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.subdomain') ? 'active' : '' }}">
        <a href="{{ route('admin.subdomain') }}">
            <i class="fa fa-globe"></i> <span>SubDomain Manager</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.game-configs'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.game-configs') ? 'active' : '' }}">
        <a href="{{ route('admin.game-configs') }}">
            <i class="fa fa-gamepad"></i> <span>Game Configs</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.advertisements'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.advertisements') ? 'active' : '' }}">
        <a href="{{ route('admin.advertisements.index') }}">
            <i class="fa fa-bullhorn"></i> <span>Advertisements</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.automatic-phpmyadmin'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.automatic-phpmyadmin') ? 'active' : '' }}">
        <a href="{{ route('admin.automatic-phpmyadmin') }}">
            <i class="fa fa-database"></i> <span>Automatic phpMyAdmin</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.extensions.serverimporter'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.extensions.serverimporter') ? 'active' : '' }}">
        <a href="/admin/extensions/serverimporter">
            <i class="fa fa-download"></i> <span>Server Importer</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.advanced-permissions'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.advanced-permissions') ? 'active' : '' }}">
        <a href="{{ route('admin.advanced-permissions') }}">
            <i class="fa fa-shield"></i> <span>Advanced Permissions</span>
        </a>
    </li>
@endif
