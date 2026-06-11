<?php

namespace App\Domains\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Product Model
 *
 * Central entity for the 26,000+ SKU catalogue. References brands and
 * categories. Supports flexible JSONB metadata for dynamic attributes.
 *
 * Status lifecycle: active → inactive (soft-deactivate, never hard-delete)
 *
 * @property int         $id
 * @property string      $sku_code
 * @property string|null $barcode
 * @property string      $product_name
 * @property int         $brand_id
 * @property int         $category_id
 * @property string      $uom_base
 * @property float       $uom_conversion
 * @property float       $reorder_point
 * @property string|null $hsn_code
 * @property array|null  $metadata
 * @property string      $status
 */
class Product extends Model
{
    protected $table = 'products';

    const UPDATED_AT = 'updated_at';
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'sku_code',
        'barcode',
        'product_name',
        'brand_id',
        'category_id',
        'uom_base',
        'uom_conversion',
        'reorder_point',
        'hsn_code',
        'metadata',
        'status',
    ];

    protected $casts = [
        'metadata'       => 'array',
        'uom_conversion' => 'decimal:4',
        'reorder_point'  => 'decimal:4',
    ];

    // ── Scopes ──

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByBrand($query, int $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // ── Relationships ──

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ProductPhoto::class);
    }

    public function primaryPhoto()
    {
        return $this->hasOne(ProductPhoto::class)->where('is_primary', true);
    }

    public function inventoryStocks(): HasMany
    {
        return $this->hasMany(\App\Domains\Inventory\Models\InventoryStock::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(\App\Domains\Inventory\Models\StockMovement::class);
    }

    /**
     * Get the total stock across all locations.
     */
    public function getTotalStockAttribute(): float
    {
        return (float) $this->inventoryStocks()->sum('qty_on_hand');
    }

    /**
     * Convert product data to MeiliSearch indexable format.
     */
    public function toSearchableArray(): array
    {
        return [
            'id'           => $this->id,
            'sku_code'     => $this->sku_code,
            'barcode'      => $this->barcode,
            'product_name' => $this->product_name,
            'brand_name'   => $this->brand?->name,
            'category_name'=> $this->category?->name,
            'uom_base'     => $this->uom_base,
            'hsn_code'     => $this->hsn_code,
            'status'       => $this->status,
        ];
    }
}
