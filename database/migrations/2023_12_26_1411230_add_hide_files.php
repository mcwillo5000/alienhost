<?php

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Pterodactyl\Models\Permission as P;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('subusers', function (Blueprint $table) {
            $table->boolean('hidefiles')->default(false)->after('denyfiles');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('subusers', function (Blueprint $table) {
            $table->dropColumn('hidefiles');
        });
    }
};
