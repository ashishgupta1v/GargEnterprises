<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inventory Stock table: Composite primary key (product_id, location_id).
     * Tracks live qty_on_hand and qty_reserved per product per location.
     * Status flags are auto-updated by the AlertEngineCommand.
     */
    public function up(): void
    {
        Schema::create('inventory_stock', function (Blueprint $table) {
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->restrictOnDelete();
            $table->foreignId('location_id')
                  ->constrained('locations')
                  ->restrictOnDelete();
            $table->decimal('qty_on_hand', 12, 4)->default(0.0000);
            $table->decimal('qty_reserved', 12, 4)->default(0.0000);
            $table->string('status_flag', 20)->default('in_stock');
            $table->timestampTz('last_movement_at')->useCurrent();

            // Composite primary key
            $table->primary(['product_id', 'location_id']);
        });

        // Status flag constraint
        DB::statement("ALTER TABLE inventory_stock ADD CONSTRAINT chk_inventory_status CHECK (status_flag IN ('in_stock', 'low_stock', 'out_of_stock', 'excess_stock', 'dead_stock', 'out_of_trend'))");

        // Alert query index: find items by stock level and status
        DB::statement('CREATE INDEX idx_inventory_alerts ON inventory_stock(qty_on_hand, status_flag)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_stock');
    }
};
