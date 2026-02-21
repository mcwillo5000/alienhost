<?php
namespace Pterodactyl\Models;
use Illuminate\Database\Eloquent\Model;
class GameConfigFile extends Model
{
    protected $fillable = [
        'game_config_definition_id',
        'path',
        'name',
        'type',
        'description',
    ];
    protected $casts = [
        //
    ];
    /**
     * Get the game definition that owns this config file.
     */
    public function gameDefinition()
    {
        return $this->belongsTo(GameConfigDefinition::class, 'game_config_definition_id');
    }
}
