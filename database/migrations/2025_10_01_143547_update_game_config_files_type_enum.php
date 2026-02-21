<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE game_config_files MODIFY COLUMN type VARCHAR(50) NOT NULL");
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE game_config_files MODIFY COLUMN type ENUM('properties', 'yaml', 'yml', 'ini', 'toml', 'cfg', 'json') NOT NULL");
    }
};
