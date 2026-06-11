<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Product Photos table: Up to 5 photos per product stored on DigitalOcean Spaces.
     * Each photo has original + thumbnail URLs. One photo is marked as primary.
     */
    public function up(): void
    {
        Schema::create('product_photos', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete();                             // Delete photos when product deleted
            $table->text('storage_url');                            // Full-res image on DO Spaces
            $table->text('thumb_url')->nullable();                  // Auto-generated thumbnail
            $table->boolean('is_primary')->default(false);
            $table->timestampTz('created_at')->useCurrent();

            // Index for product photo lookups
            $table->index(['product_id', 'is_primary']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_photos');
    }
};
