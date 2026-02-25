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
    ];

    protected $casts = [
        'admin_routes' => 'array',
    ];

    protected $attributes = [
        'description'       => null,
        'admin_routes'      => null,
        'server_group_id'   => null,
        'server_group_mode' => null,
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
