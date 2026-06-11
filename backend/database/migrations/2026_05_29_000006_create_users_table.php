<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Users table: All app users. Phone number is the unique login identifier.
     * PIN stored as bcrypt hash. Device IDs stored as JSONB array (max 2).
     * 4 roles: owner, manager, staff, godown.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->string('name', 150);
            $table->string('phone', 20)->unique();                 // Login identifier
            $table->string('pin_hash', 255);                       // bcrypt (rounds=10) of 6-digit PIN
            $table->string('role', 20);                            // owner, manager, staff, godown
            $table->jsonb('device_ids')->default('[]');             // SHA-256 fingerprints (max 2)
            $table->string('status', 20)->default('active');
            $table->timestampTz('created_at')->useCurrent();
        });

        // Role constraint
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('owner', 'manager', 'staff', 'godown'))");

        // Status constraint
        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
