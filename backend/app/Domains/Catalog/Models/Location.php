<?php

namespace App\Domains\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Location Model
 *
 * Physical warehouse location tree: Floor → Section → Aisle → Bin.
 * Self-referential via parent_id. Each location has a unique human-readable code
 * like "GF-SA-A3-B2" for barcode labels and scanning.
 *
 * @property int         $id
 * @property int|null    $parent_id
 * @property string      $name
 * @property string      $code          Unique location code (e.g. GF-SA-A3-B2)
 * @property string      $type          floor|section|aisle|bin
 * @property int|null    $capacity_units
 * @property bool        $is_active
 */
class Location extends Model
{
    protected $table = 'locations';

    public $timestamps = false;

    protected $fillable = [
        'parent_id',
        'name',
        'code',
        'type',
        'capacity_units',
        'is_active',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'capacity_units' => 'integer',
    ];

    // ── Self-Referential Relationships ──

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    public function inventoryStocks(): HasMany
    {
        return $this->hasMany(\App\Domains\Inventory\Models\InventoryStock::class);
    }

    // ── Scopes ──

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Build the full location tree as nested JSON.
     */
    public static function buildTree(): \Illuminate\Database\Eloquent\Collection
    {
        return self::roots()->active()->with('childrenRecursive')->get();
    }
}
