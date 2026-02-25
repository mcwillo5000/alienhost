<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('advanced_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('server_group_id')
                  ->nullable()
                  ->after('admin_routes');

            // 'allow' = only these servers, 'deny' = all except these servers
            $table->string('server_group_mode', 10)
                  ->nullable()
                  ->after('server_group_id');

            $table->foreign('server_group_id')
                  ->references('id')->on('server_groups')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('advanced_roles', function (Blueprint $table) {
            $table->dropForeign(['server_group_id']);
            $table->dropColumn(['server_group_id', 'server_group_mode']);
        });
    }
};
