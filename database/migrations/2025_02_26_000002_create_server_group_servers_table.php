<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('server_group_servers', function (Blueprint $table) {
            $table->unsignedBigInteger('server_group_id');
            $table->unsignedInteger('server_id');  // matches servers.id int(10) unsigned

            $table->primary(['server_group_id', 'server_id']);

            $table->foreign('server_group_id')
                  ->references('id')->on('server_groups')
                  ->onDelete('cascade');

            $table->foreign('server_id')
                  ->references('id')->on('servers')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('server_group_servers');
    }
};
