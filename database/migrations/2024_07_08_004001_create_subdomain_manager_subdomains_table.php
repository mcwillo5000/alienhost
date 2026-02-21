<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubdomainManagerSubdomainsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('subdomain_manager_subdomains', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('server_id');
            $table->integer('domain_id');
            $table->string('subdomain');
            $table->string('ip')->nullable();
            $table->integer('port');
            $table->string('record_type');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('subdomain_manager_subdomains');
    }
}
