<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('advanced_roles', function (Blueprint $table) {
            $table->json('server_sub_permissions')->nullable()->after('server_permissions');
        });
    }

    public function down(): void
    {
        Schema::table('advanced_roles', function (Blueprint $table) {
            $table->dropColumn('server_sub_permissions');
        });
    }
};
