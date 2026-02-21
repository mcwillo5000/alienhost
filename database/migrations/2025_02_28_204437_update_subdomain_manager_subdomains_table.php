<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subdomain_manager_subdomains', function (Blueprint $table) {
            $table->string('protocol')->default('tcp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subdomain_manager_subdomains', function (Blueprint $table) {
            $table->dropColumn('protocol');
        });
    }
};
