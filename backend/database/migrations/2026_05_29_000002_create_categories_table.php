<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Categories table: 4-level hierarchical category tree using PostgreSQL LTREE extension.
     * Enables fast subtree queries via GiST index on the `path` column.
     */
    public function up(): void
    {
        // Enable LTREE extension for hierarchical path queries
        DB::statement('CREATE EXTENSION IF NOT EXISTS ltree');

        Schema::create('categories', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete();                                // Self-referential FK
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->smallInteger('level');                          // 1-4 depth level
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
        });

        // Add LTREE path column (not supported natively by Blueprint)
        DB::statement('ALTER TABLE categories ADD COLUMN path ltree NOT NULL DEFAULT \'\'');

        // GiST index for fast LTREE subtree queries (e.g. path <@ 'electrical.lighting')
        DB::statement('CREATE INDEX idx_categories_path ON categories USING gist(path)');

        // Parent lookup index
        DB::statement('CREATE INDEX idx_categories_parent ON categories(parent_id)');

        // Enforce level constraint
        DB::statement('ALTER TABLE categories ADD CONSTRAINT chk_categories_level CHECK (level BETWEEN 1 AND 4)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
