<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Stock Movements table: The Maker-Checker transaction core.
     * Every stock change is recorded here. Non-owner submissions start as 'pending'.
     * Once approved, qty is atomically applied to inventory_stock within a DB transaction.
     * Supports 6 movement types: inward, outward, transfer, write_off, reserve, release.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->restrictOnDelete();
            $table->foreignId('from_location_id')
                  ->nullable()
                  ->constrained('locations')
                  ->restrictOnDelete();
            $table->foreignId('to_location_id')
                  ->nullable()
                  ->constrained('locations')
                  ->restrictOnDelete();
            $table->decimal('qty', 12, 4);                         // Quantity (always > 0)
            $table->string('movement_type', 20);                   // inward, outward, transfer, etc.
            $table->string('status', 20)->default('pending');      // pending, approved, rejected
            $table->foreignId('submitted_by')
                  ->constrained('users');
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users');
            $table->text('photo_url')->nullable();                 // Optional evidence photo
            $table->string('rejection_reason', 255)->nullable();
            $table->timestampTz('submitted_at')->useCurrent();
            $table->timestampTz('processed_at')->nullable();
        });

        // Quantity must be positive
        DB::statement('ALTER TABLE stock_movements ADD CONSTRAINT chk_movements_qty CHECK (qty > 0)');

        // Movement type constraint
        DB::statement("ALTER TABLE stock_movements ADD CONSTRAINT chk_movements_type CHECK (movement_type IN ('inward', 'outward', 'transfer', 'write_off', 'reserve', 'release'))");

        // Status constraint
        DB::statement("ALTER TABLE stock_movements ADD CONSTRAINT chk_movements_status CHECK (status IN ('pending', 'approved', 'rejected'))");

        // Pending queue index: Owner approval queue (status + newest first)
        DB::statement('CREATE INDEX idx_movements_status_time ON stock_movements(status, submitted_at DESC)');

        // Product history index: movement history per product
        DB::statement('CREATE INDEX idx_movements_product_time ON stock_movements(product_id, submitted_at DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
