<?php

namespace App\Domains\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProductPhoto Model
 *
 * Up to 5 photos per product. Stored on DigitalOcean Spaces.
 * Each photo has a full-resolution URL and an auto-generated thumbnail.
 * One photo per product is marked as the primary display photo.
 *
 * @property int         $id
 * @property int         $product_id
 * @property string      $storage_url   Full-res image URL on DO Spaces
 * @property string|null $thumb_url     Auto-generated thumbnail
 * @property bool        $is_primary
 */
class ProductPhoto extends Model
{
    protected $table = 'product_photos';

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'storage_url',
        'thumb_url',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
