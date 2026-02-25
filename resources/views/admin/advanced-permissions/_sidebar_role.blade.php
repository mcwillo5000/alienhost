{{--
    Sidebar for users who have an Advanced Permissions role (not root_admin).
    Included from layouts/admin.blade.php inside @else block.
    Usage: @include('admin.advanced-permissions._sidebar_role', ['role' => $advancedRole])
--}}
@php
    $hasAccess = function (string $prefix) use ($role): bool {
        if (!$role) return false;
        return $role->canAccessRoute($prefix);
    };
@endphp

{{-- Overview is always visible --}}
<li class="{{ starts_with(Route::currentRouteName(), 'admin.index') ? 'active' : '' }}">
    <a href="{{ route('admin.index') }}">
        <i class="fa fa-home"></i> <span>Overview</span>
    </a>
</li>

{{-- ── BASIC ADMINISTRATION ── --}}

@if ($hasAccess('admin.settings'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.settings') ? 'active' : '' }}">
        <a href="{{ route('admin.settings') }}">
            <i class="fa fa-cog"></i> <span>Settings</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.api'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.api') ? 'active' : '' }}">
        <a href="{{ route('admin.api.index') }}">
            <i class="fa fa-key"></i> <span>Application API</span>
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

{{-- ── MANAGEMENT ── --}}

@if ($hasAccess('admin.databases'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.databases') ? 'active' : '' }}">
        <a href="{{ route('admin.databases') }}">
            <i class="fa fa-database"></i> <span>Database Hosts</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.locations'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.locations') ? 'active' : '' }}">
        <a href="{{ route('admin.locations') }}">
            <i class="fa fa-map-marker"></i> <span>Locations</span>
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

{{-- ── SERVICE MANAGEMENT ── --}}

@if ($hasAccess('admin.mounts'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.mounts') ? 'active' : '' }}">
        <a href="{{ route('admin.mounts') }}">
            <i class="fa fa-hdd-o"></i> <span>Mounts</span>
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

{{-- ── ADDONS ── --}}

@if ($hasAccess('admin.veltastudios'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.veltastudios') ? 'active' : '' }}">
        <a href="{{ route('admin.veltastudios.index') }}">
            <i class="fa fa-plug"></i> <span>Velta Studios</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.subdomain'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.subdomain') ? 'active' : '' }}">
        <a href="{{ route('admin.subdomain.index') }}">
            <i class="fa fa-globe"></i> <span>Subdomain Manager</span>
        </a>
    </li>
@endif

@if ($hasAccess('admin.game-configs'))
    <li class="{{ starts_with(Route::currentRouteName(), 'admin.game-configs') ? 'active' : '' }}">
        <a href="{{ route('admin.game-configs.index') }}">
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
        <a href="{{ route('admin.automatic-phpmyadmin.index') }}">
            <i class="fa fa-table"></i> <span>phpMyAdmin</span>
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
