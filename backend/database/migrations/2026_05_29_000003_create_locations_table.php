<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Locations table: Physical warehouse location tree (Floor → Section → Aisle → Bin).
     * Self-referential hierarchy using parent_id. Each location has a unique code
     * like "GF-SA-A3-B2" for easy scanning and human reference.
     */
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('locations')
                  ->nullOnDelete();                                // Self-referential FK
            $table->string('name', 100);
            $table->string('code', 30)->unique();                  // Human-readable code e.g. GF-SA-A3-B2
            $table->string('type', 20);                            // floor, section, aisle, bin
            $table->integer('capacity_units')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
        });

        // Enforce type constraint
        DB::statement("ALTER TABLE locations ADD CONSTRAINT chk_locations_type CHECK (type IN ('floor', 'section', 'aisle', 'bin'))");

        // Composite index for parent + type lookups
        DB::statement('CREATE INDEX idx_locations_parent_type ON locations(parent_id, type)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
