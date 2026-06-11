<?php

namespace App\Domains\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * InventoryStock Model
 *
 * Composite primary key: (product_id, location_id).
 * Tracks live qty_on_hand and qty_reserved per product per location.
 *
 * Status flags are auto-updated daily by the AlertEngineCommand:
 *   in_stock | low_stock | out_of_stock | excess_stock | dead_stock | out_of_trend
 *
 * @property int    $product_id
 * @property int    $location_id
 * @property float  $qty_on_hand
 * @property float  $qty_reserved
 * @property string $status_flag
 * @property string $last_movement_at
 */
class InventoryStock extends Model
{
    protected $table = 'inventory_stock';

    public $incrementing = false;
    public $timestamps = false;

    protected $primaryKey = null; // Composite PK, handled manually

    protected $fillable = [
        'product_id',
        'location_id',
        'qty_on_hand',
        'qty_reserved',
        'status_flag',
        'last_movement_at',
    ];

    protected $casts = [
        'qty_on_hand'  => 'decimal:4',
        'qty_reserved' => 'decimal:4',
    ];

    /**
     * Override getKey for composite primary key.
     */
    public function getKey()
    {
        return $this->product_id . '-' . $this->location_id;
    }

    // ── Computed Attributes ──

    /**
     * Available quantity = on_hand - reserved.
     */
    public function getQtyAvailableAttribute(): float
    {
        return (float) $this->qty_on_hand - (float) $this->qty_reserved;
    }

    // ── Relationships ──

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Catalog\Models\Product::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Catalog\Models\Location::class);
    }

    // ── Scopes ──

    public function scopeOutOfStock($query)
    {
        return $query->where('status_flag', 'out_of_stock');
    }

    public function scopeLowStock($query)
    {
        return $query->where('status_flag', 'low_stock');
    }

    public function scopeDeadStock($query)
    {
        return $query->where('status_flag', 'dead_stock');
    }

    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByLocation($query, int $locationId)
    {
        return $query->where('location_id', $locationId);
    }
}
