<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedule_template_tasks', function (Blueprint $table) {
            $table->integer('order_index')->default(0)->after('continue_on_failure');
        });
    }

    public function down(): void
    {
        Schema::table('schedule_template_tasks', function (Blueprint $table) {
            $table->dropColumn('order_index');
        });
    }
};