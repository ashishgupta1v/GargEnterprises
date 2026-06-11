<?php

namespace App\Domains\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Category Model
 *
 * 4-level hierarchical category tree using PostgreSQL LTREE extension.
 * Self-referential via parent_id. Path column enables fast subtree queries.
 *
 * Example tree:
 *   Electrical (level 1) → Lighting (level 2) → LED Panels (level 3) → Downlights (level 4)
 *   Path: "electrical.lighting.led_panels.downlights"
 *
 * @property int         $id
 * @property int|null    $parent_id
 * @property string      $name
 * @property string      $slug
 * @property int         $level      1-4
 * @property string      $path       LTREE path for hierarchical queries
 * @property int         $sort_order
 */
class Category extends Model
{
    protected $table = 'categories';

    public $timestamps = false;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'level',
        'path',
        'sort_order',
    ];

    // ── Self-Referential Relationships ──

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Recursively load children for tree rendering.
     */
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // ── Scopes ──

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id')->orderBy('sort_order');
    }

    /**
     * Build the full category tree as nested JSON.
     */
    public static function buildTree(): \Illuminate\Database\Eloquent\Collection
    {
        return self::roots()->with('childrenRecursive')->get();
    }
}
