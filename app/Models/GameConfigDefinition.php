<?php
namespace Pterodactyl\Models;
use Illuminate\Database\Eloquent\Model;
class GameConfigDefinition extends Model
{
    protected $fillable = [
        'game_type',
        'game_name',
    ];
    protected $casts = [
        //
    ];
    /**
     * Get the config files for this game definition.
     */
    public function configFiles()
    {
        return $this->hasMany(GameConfigFile::class);
    }
}
