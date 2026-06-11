<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Products table: Central SKU master. Every product in the 26,000+ catalogue.
     * References brands and categories. Supports barcode, HSN codes, flexible
     * JSONB metadata, and unit-of-measure conversion factors.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();                                          // BIGSERIAL PK
            $table->string('sku_code', 50)->unique();              // Internal SKU
            $table->string('barcode', 100)->unique()->nullable();  // Manufacturer barcode (nullable for QR-generated)
            $table->string('product_name', 255);
            $table->foreignId('brand_id')
                  ->constrained('brands')
                  ->restrictOnDelete();
            $table->foreignId('category_id')
                  ->constrained('categories')
                  ->restrictOnDelete();
            $table->string('uom_base', 20)->default('pcs');        // Base unit of measure
            $table->decimal('uom_conversion', 10, 4)->default(1.0000);
            $table->decimal('reorder_point', 12, 4)->default(0.0000);
            $table->string('hsn_code', 20)->nullable();            // HSN code for future GST
            $table->jsonb('metadata')->nullable();                 // Flexible key-value attributes
            $table->string('status', 20)->default('active');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        // Status constraint
        DB::statement("ALTER TABLE products ADD CONSTRAINT chk_products_status CHECK (status IN ('active', 'inactive'))");

        // Composite index for brand+category filtered queries
        DB::statement('CREATE INDEX idx_products_brand_cat ON products(brand_id, category_id)');

        // Partial index for barcode lookups (only non-null barcodes)
        DB::statement('CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL');

        // GIN index for JSONB metadata queries
        DB::statement('CREATE INDEX idx_products_metadata ON products USING gin(metadata)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
