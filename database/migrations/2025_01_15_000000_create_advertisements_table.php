<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tableExists = Schema::hasTable('advertisements');
        $hasOldCommandColumn = $tableExists && Schema::hasColumn('advertisements', 'command');
        $hasCommandsColumn = $tableExists && Schema::hasColumn('advertisements', 'commands');

        $hasCommandTypesColumn = $tableExists && Schema::hasColumn('advertisements', 'command_types');

        if (!$tableExists) {
            Schema::create('advertisements', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('nest_id');
                $table->string('name');
                $table->json('commands');
                $table->json('command_types')->nullable();
                $table->unsignedInteger('interval_minutes');
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_sent_at')->nullable();
                $table->timestamps();
            });

            Schema::table('advertisements', function (Blueprint $table) {
                $table->foreign('nest_id')->references('id')->on('nests')->onDelete('cascade');
                $table->index(['nest_id', 'is_active']);
            });
        } else {
            if ($hasOldCommandColumn && !$hasCommandsColumn) {
                Schema::table('advertisements', function (Blueprint $table) {
                    $table->json('commands')->nullable()->after('name');
                });

                DB::statement('UPDATE advertisements SET commands = JSON_ARRAY(command) WHERE commands IS NULL');

                Schema::table('advertisements', function (Blueprint $table) {
                    $table->dropColumn('command');
                });

                Schema::table('advertisements', function (Blueprint $table) {
                    $table->json('commands')->nullable(false)->change();
                });
            } elseif (!$hasCommandsColumn) {
                Schema::table('advertisements', function (Blueprint $table) {
                    $table->json('commands')->after('name');
                });
            }

            if (!$hasCommandTypesColumn) {
                Schema::table('advertisements', function (Blueprint $table) {
                    $table->json('command_types')->nullable()->after('commands');
                });
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
