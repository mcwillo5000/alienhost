<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array|null $admin_routes
 * @property array|null $server_permissions
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class AdvancedRole extends Model
{
    protected $table = 'advanced_roles';

    protected $fillable = [
        'name',
        'description',
        'admin_routes',
        'server_group_id',
        'server_group_mode',
        'server_permissions',
    ];

    protected $casts = [
        'admin_routes'       => 'array',
        'server_permissions' => 'array',
    ];

    protected $attributes = [
        'description'        => null,
        'admin_routes'       => null,
        'server_group_id'    => null,
        'server_group_mode'  => null,
        'server_permissions' => null,
    ];

    /**
     * All assignable admin route sections. These are the route name prefixes
     * that can be granted to a role. Each key maps to the route prefix used
     * in admin.php.
     */
    public static array $availableSections = [
        'BASIC ADMINISTRATION' => [
            'admin.settings'              => 'Settings',
            'admin.api'                   => 'Application API',
            'admin.rivion'                => 'Rivion Theme',
        ],
        'MANAGEMENT' => [
            'admin.databases'             => 'Databases',
            'admin.locations'             => 'Locations',
            'admin.nodes'                 => 'Nodes',
            'admin.servers'               => 'Servers',
            'admin.users'                 => 'Users',
        ],
        'SERVICE MANAGEMENT' => [
            'admin.mounts'                => 'Mounts',
            'admin.nests'                 => 'Nests',
        ],
        'ADDONS' => [
            'admin.veltastudios'               => 'Schedule Templates',
            'admin.subdomain'                  => 'Subdomain Manager',
            'admin.game-configs'               => 'Game Configs',
            'admin.advertisements'             => 'Advertisements',
            'admin.automatic-phpmyadmin'       => 'Automatic phpMyAdmin',
            'admin.extensions.serverimporter'  => 'Server Importer',
            'admin.advanced-permissions'       => 'Advanced Permissions',
        ],
        'FRONTEND' => [
            // Special non-route permissions that control frontend behaviour.
            // These are stored in admin_routes JSON but do NOT map to admin panel routes.
            'special.server_access' => 'Server Access (view & access all servers on the dashboard)',
        ],
    ];

    /**
     * All server-side pages that can be enabled/disabled per role.
     *
     * 'permissions' are injected into GetUserPermissionsService for role users.
     * An empty 'permissions' array means there is no Pterodactyl permission gate
     * for this page — sidebar visibility is still controlled via page.{key}.
     * NULL server_permissions on a role means unrestricted access (legacy behaviour).
     */
    public static array $availableServerSections = [
        'OVERVIEW' => [
            'console'    => [
                'label'       => 'Console & Power Controls',
                'description' => 'View server console and use start/stop/restart buttons.',
                'permissions' => ['control.console', 'control.start', 'control.stop', 'control.restart', 'websocket.connect'],
            ],
            'serverinfo' => [
                'label'       => 'Server Info',
                'description' => 'View the server information / overview page.',
                'permissions' => [],
            ],
        ],
        'CONFIGURATION' => [
            'schedules'  => [
                'label'       => 'Schedules',
                'description' => 'Create, edit and delete server task schedules.',
                'permissions' => ['schedule.create', 'schedule.read', 'schedule.update', 'schedule.delete'],
            ],
            'network'    => [
                'label'       => 'Network',
                'description' => 'Manage server allocations and ports.',
                'permissions' => ['allocation.read', 'allocation.create', 'allocation.update', 'allocation.delete'],
            ],
            'startup'    => [
                'label'       => 'Startup',
                'description' => 'View and modify server startup variables.',
                'permissions' => ['startup.read', 'startup.update'],
            ],
            'settings'   => [
                'label'       => 'Settings',
                'description' => 'Rename, reinstall and configure server settings.',
                'permissions' => ['settings.read', 'settings.update', 'settings.rename', 'settings.reinstall', 'file.sftp'],
            ],
            'subdomain'  => [
                'label'       => 'Subdomain',
                'description' => 'Manage the server subdomain (Subdomain Manager addon).',
                'permissions' => [],
            ],
        ],
        'MANAGEMENT' => [
            'files'       => [
                'label'       => 'File Manager',
                'description' => 'Browse, edit, upload and delete server files.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete', 'file.archive', 'file.sftp', 'file.list-directory'],
            ],
            'databases'   => [
                'label'       => 'Databases',
                'description' => 'Create, view and manage server databases.',
                'permissions' => ['database.create', 'database.read', 'database.update', 'database.delete', 'database.view_password'],
            ],
            'backups'     => [
                'label'       => 'Backups',
                'description' => 'Create, download and restore server backups.',
                'permissions' => ['backup.create', 'backup.read', 'backup.update', 'backup.delete', 'backup.download'],
            ],
            'importer'    => [
                'label'       => 'Server Importer',
                'description' => 'Import server files (Server Importer addon).',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.delete'],
            ],
            'game-config' => [
                'label'       => 'Game Config',
                'description' => 'Edit game configuration files (Game Config Editor addon).',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
        ],
        'MINECRAFT (NEST 1)' => [
            'minecraft-plugins' => [
                'label'       => 'Plugins',
                'description' => 'Browse and install server plugins.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'mods'              => [
                'label'       => 'Mods',
                'description' => 'Browse and manage Minecraft mods.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'modpacks'          => [
                'label'       => 'Modpacks',
                'description' => 'Install and manage Minecraft modpacks.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'player-manager'    => [
                'label'       => 'Player Manager',
                'description' => 'View and manage Minecraft player data.',
                'permissions' => ['file.read', 'file.read-content'],
            ],
        ],
        'ACCESS & LOGS' => [
            'users'    => [
                'label'       => 'User Management',
                'description' => 'Add, edit and remove server subusers.',
                'permissions' => ['user.create', 'user.read', 'user.update', 'user.delete'],
            ],
            'activity' => [
                'label'       => 'Activity Log',
                'description' => 'View the server activity log.',
                'permissions' => ['activity.read'],
            ],
        ],
        'HYTALE (NEST 5)' => [
            'hytale-mods'          => [
                'label'       => 'Hytale Mods',
                'description' => 'Browse and manage Hytale mods.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'hytale-worlds'        => [
                'label'       => 'Hytale Worlds',
                'description' => 'Manage Hytale world files.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'hytale-prefabs'       => [
                'label'       => 'Hytale Prefabs',
                'description' => 'Manage Hytale prefab files.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'hytale-game-settings' => [
                'label'       => 'Hytale Game Settings',
                'description' => 'Edit Hytale game configuration.',
                'permissions' => ['file.create', 'file.read', 'file.read-content', 'file.update', 'file.delete'],
            ],
            'hytale-players'       => [
                'label'       => 'Hytale Players',
                'description' => 'View and manage Hytale player data.',
                'permissions' => [],
            ],
        ],
    ];

    /**
     * Returns a flat map of all server page keys => their data.
     * Used by GetUserPermissionsService to build permission arrays.
     */
    public static function getPagePermissionMap(): array
    {
        $map = [];
        foreach (static::$availableServerSections as $pages) {
            foreach ($pages as $key => $data) {
                $map[$key] = $data;
            }
        }
        return $map;
    }

    /**
     * Returns the users assigned to this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'adv_role_id');
    }

    /**
     * Returns the number of users currently assigned to this role.
     */
    public function getUserCountAttribute(): int
    {
        return $this->users()->count();
    }

    /**
     * Returns the number of route sections this role has access to.
     */
    public function getRouteCountAttribute(): int
    {
        return count($this->admin_routes ?? []);
    }

    /**
     * Checks whether this role grants access to a given admin route name.
     * The overview (admin.index) is always accessible.
     */
    public function canAccessRoute(string $routeName): bool
    {
        if ($routeName === 'admin.index') {
            return true;
        }

        foreach ($this->admin_routes ?? [] as $prefix) {
            if ($routeName === $prefix || str_starts_with($routeName, $prefix . '.')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks whether this role has a specific special (non-route) permission,
     * e.g. 'special.server_access'.
     */
    public function hasSpecialPermission(string $key): bool
    {
        return in_array($key, $this->admin_routes ?? [], true);
    }

    /**
     * The server group filter applied to the Server Access permission.
     * When set together with server_group_mode ('allow'/'deny') it limits
     * which servers a Server Access user can actually reach.
     */
    public function serverGroup(): BelongsTo
    {
        return $this->belongsTo(ServerGroup::class, 'server_group_id');
    }
}
