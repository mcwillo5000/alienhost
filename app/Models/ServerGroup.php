<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int         $id
 * @property string      $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class ServerGroup extends Model
{
    protected $table = 'server_groups';

    protected $fillable = [
        'name',
        'description',
    ];

    protected $attributes = [
        'description' => null,
    ];

    /**
     * All servers that are members of this group.
     */
    public function servers(): BelongsToMany
    {
        return $this->belongsToMany(Server::class, 'server_group_servers', 'server_group_id', 'server_id');
    }

    /**
     * Roles that reference this server group.
     */
    public function roles(): HasMany
    {
        return $this->hasMany(AdvancedRole::class, 'server_group_id');
    }

    /**
     * Returns the number of servers in this group.
     */
    public function getServerCountAttribute(): int
    {
        return $this->servers()->count();
    }

    /**
     * Returns the number of roles using this group.
     */
    public function getRoleCountAttribute(): int
    {
        return $this->roles()->count();
    }
}
