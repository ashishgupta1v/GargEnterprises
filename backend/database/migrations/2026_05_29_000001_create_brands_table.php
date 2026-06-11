<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Brands table: Master brand registry for product classification.
     */
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('logo_url')->nullable();
            $table->boolean('is_authorised')->default(false);      // Authorised dealer flag
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        // Slug lookup index
        Schema::table('brands', function () {
            // Already unique from column definition
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
