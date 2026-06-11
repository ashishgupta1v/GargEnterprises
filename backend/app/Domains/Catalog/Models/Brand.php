<?php

namespace App\Domains\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Brand Model
 *
 * Master brand registry. Each brand may have many products.
 * is_authorised flag indicates whether Garg Enterprises is an
 * authorized dealer for this brand.
 *
 * @property int         $id
 * @property string      $name
 * @property string      $slug
 * @property string|null $logo_url
 * @property bool        $is_authorised
 */
class Brand extends Model
{
    protected $table = 'brands';

    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'is_authorised',
    ];

    protected $casts = [
        'is_authorised' => 'boolean',
    ];

    // ── Relationships ──

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
