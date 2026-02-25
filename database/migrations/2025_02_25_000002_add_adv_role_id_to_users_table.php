<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('adv_role_id')->nullable()->after('root_admin');
            $table->foreign('adv_role_id')->references('id')->on('advanced_roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['adv_role_id']);
            $table->dropColumn('adv_role_id');
        });
    }
};
