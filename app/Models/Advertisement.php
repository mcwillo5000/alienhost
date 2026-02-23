<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $table = 'advertisements';

    protected $fillable = [
        'nest_id',
        'name',
        'commands',
        'command_types',
        'interval_minutes',
        'is_active',
        'last_sent_at',
    ];

    protected $casts = [
        'nest_id' => 'integer',
        'commands' => 'array',
        'command_types' => 'array',
        'interval_minutes' => 'integer',
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function nest()
    {
        return $this->belongsTo(\Pterodactyl\Models\Nest::class, 'nest_id');
    }

    public function servers()
    {
        return \Pterodactyl\Models\Server::whereIn('egg_id', function($query) {
            $query->select('id')
                ->from('eggs')
                ->where('nest_id', $this->nest_id);
        })->get();
    }
}

