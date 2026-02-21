<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('cron_minute');
            $table->string('cron_hour');
            $table->string('cron_day_of_month');
            $table->string('cron_month');
            $table->string('cron_day_of_week');
            $table->timestamps();
        });

        Schema::create('schedule_template_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('schedule_template_id');
            $table->string('action');
            $table->string('payload');
            $table->integer('time_offset');
            $table->boolean('continue_on_failure');
            $table->timestamps();

            $table->foreign('schedule_template_id')
                  ->references('id')->on('schedule_templates')
                  ->onDelete('cascade');
        });

        $dailyRestartId = DB::table('schedule_templates')->insertGetId([
            'name' => 'Daily Restart',
            'description' => 'Automatically restart your server every 24 hours.',
            'cron_minute' => '0',
            'cron_hour' => '0',
            'cron_day_of_month' => '*/1',
            'cron_month' => '*',
            'cron_day_of_week' => '*',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $automaticBackupsId = DB::table('schedule_templates')->insertGetId([
            'name' => 'Automatic Backups',
            'description' => 'Create an off-site backup every 24 hours.',
            'cron_minute' => '0',
            'cron_hour' => '0',
            'cron_day_of_month' => '*/1',
            'cron_month' => '*',
            'cron_day_of_week' => '*',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('schedule_template_tasks')->insert([
            [
                'schedule_template_id' => $dailyRestartId,
                'action' => 'command',
                'payload' => 'restart',
                'time_offset' => 0,
                'continue_on_failure' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'schedule_template_id' => $automaticBackupsId,
                'action' => 'backup',
                'payload' => 'true',
                'time_offset' => 0,
                'continue_on_failure' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_template_tasks');
        Schema::dropIfExists('schedule_templates');
    }
};