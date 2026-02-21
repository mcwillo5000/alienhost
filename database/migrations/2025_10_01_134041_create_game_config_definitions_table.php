<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_config_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('game_type')->unique(); 
            $table->string('game_name'); 
            $table->timestamps();
        });
        Schema::create('game_config_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_config_definition_id')->constrained()->onDelete('cascade');
            $table->string('path'); 
            $table->string('name'); 
            $table->enum('type', ['properties', 'yaml', 'yml', 'ini', 'toml', 'cfg', 'json']); 
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_config_files');
        Schema::dropIfExists('game_config_definitions');
    }
};
