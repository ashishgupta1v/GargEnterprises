<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Activity Log table: Immutable, append-only audit trail.
     * Records every mutation in the system with before/after JSONB snapshots.
     * The application DB user is explicitly denied UPDATE and DELETE on this table.
     */
    public function up(): void
    {
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();                                // Nullable for system-triggered entries
            $table->string('action', 100);                         // e.g. product.created, movement.approved
            $table->string('entity_type', 50);                     // e.g. product, stock_movement
            $table->bigInteger('entity_id');                        // ID of the affected entity
            $table->jsonb('old_value')->nullable();                 // Previous state snapshot
            $table->jsonb('new_value')->nullable();                 // New state snapshot
            $table->timestampTz('created_at')->useCurrent();
        });

        // User activity timeline index
        DB::statement('CREATE INDEX idx_audit_user_time ON activity_log(user_id, created_at DESC)');

        // Entity lookup index (find all changes to a specific entity)
        DB::statement('CREATE INDEX idx_audit_entity ON activity_log(entity_type, entity_id)');

        // CRITICAL: Revoke UPDATE and DELETE on this table to enforce append-only
        // This runs as a raw statement and must be executed by a superuser or table owner
        DB::statement('REVOKE UPDATE, DELETE ON activity_log FROM PUBLIC');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};
