<?php

namespace App\Domains\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * StockMovement Model
 *
 * The Maker-Checker transaction record. Every stock change is recorded here.
 * Non-owner submissions start as 'pending' and require Owner approval.
 * Once approved, qty is atomically applied to inventory_stock.
 *
 * Movement types: inward | outward | transfer | write_off | reserve | release
 * Status:         pending | approved | rejected
 *
 * @property int         $id
 * @property int         $product_id
 * @property int|null    $from_location_id   Null for inward
 * @property int|null    $to_location_id     Null for outward
 * @property float       $qty                Always > 0
 * @property string      $movement_type
 * @property string      $status
 * @property int         $submitted_by       FK to users
 * @property int|null    $approved_by        FK to users (null until processed)
 * @property string|null $photo_url          Evidence photo
 * @property string|null $rejection_reason
 * @property string      $submitted_at
 * @property string|null $processed_at
 */
class StockMovement extends Model
{
    protected $table = 'stock_movements';

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'from_location_id',
        'to_location_id',
        'qty',
        'movement_type',
        'status',
        'submitted_by',
        'approved_by',
        'photo_url',
        'rejection_reason',
        'submitted_at',
        'processed_at',
    ];

    protected $casts = [
        'qty'          => 'decimal:4',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    // ── Status Checks ──

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    // ── Relationships ──

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Catalog\Models\Product::class);
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Catalog\Models\Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Catalog\Models\Location::class, 'to_location_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'submitted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'approved_by');
    }

    // ── Scopes ──

    public function scopePending($query)
    {
        return $query->where('status', 'pending')->orderBy('submitted_at', 'desc');
    }

    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }
}
