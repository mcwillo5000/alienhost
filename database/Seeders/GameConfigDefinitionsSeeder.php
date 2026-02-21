<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Pterodactyl\Models\GameConfigDefinition;
use Pterodactyl\Models\GameConfigFile;
class GameConfigDefinitionsSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        GameConfigFile::truncate();
        GameConfigDefinition::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $minecraft = GameConfigDefinition::create([
            'game_type' => 'minecraft',
            'game_name' => 'Minecraft',
        ]);
        $minecraftFiles = [
            ['path' => 'server.properties', 'name' => 'Server Properties', 'type' => 'properties'],
            ['path' => 'bukkit.yml', 'name' => 'Bukkit Config', 'type' => 'yml'],
            ['path' => 'spigot.yml', 'name' => 'Spigot Config', 'type' => 'yml'],
            ['path' => 'paper.yml', 'name' => 'Paper Config', 'type' => 'yml'],
            ['path' => 'config/paper-global.yml', 'name' => 'Paper Global Config', 'type' => 'yml'],
            ['path' => 'config/paper-world-defaults.yml', 'name' => 'Paper World Defaults Config', 'type' => 'yml'],
        ];
        foreach ($minecraftFiles as $file) {
            GameConfigFile::create([
                'game_config_definition_id' => $minecraft->id,
                'path' => $file['path'],
                'name' => $file['name'],
                'type' => $file['type'],
            ]);
        }
        $ark = GameConfigDefinition::create([
            'game_type' => 'ark',
            'game_name' => 'Ark Survival',
        ]);
        $arkFiles = [
            ['path' => 'ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini', 'name' => 'Game User Settings', 'type' => 'ini'],
            ['path' => 'ShooterGame/Saved/Config/LinuxServer/Game.ini', 'name' => 'Game Config', 'type' => 'ini'],
        ];
        foreach ($arkFiles as $file) {
            GameConfigFile::create([
                'game_config_definition_id' => $ark->id,
                'path' => $file['path'],
                'name' => $file['name'],
                'type' => $file['type'],
            ]);
        }
        $rust = GameConfigDefinition::create([
            'game_type' => 'rust',
            'game_name' => 'Rust',
        ]);
        $rustFiles = [
            ['path' => 'server/rust/cfg/server.cfg', 'name' => 'Server Config', 'type' => 'cfg'],
            ['path' => 'server/rust/cfg/users.cfg', 'name' => 'Users Config', 'type' => 'cfg'],
            ['path' => 'server/rust/cfg/bans.cfg', 'name' => 'Bans Config', 'type' => 'cfg'],
            ['path' => 'server/rust/cfg/serverauto.cfg', 'name' => 'Server Auto Config', 'type' => 'cfg'],
        ];
        foreach ($rustFiles as $file) {
            GameConfigFile::create([
                'game_config_definition_id' => $rust->id,
                'path' => $file['path'],
                'name' => $file['name'],
                'type' => $file['type'],
            ]);
        }
        $fivem = GameConfigDefinition::create([
            'game_type' => 'fivem',
            'game_name' => 'FiveM',
        ]);
        GameConfigFile::create([
            'game_config_definition_id' => $fivem->id,
            'path' => 'server.cfg',
            'name' => 'Server Config',
            'type' => 'cfg',
        ]);
    }
}
