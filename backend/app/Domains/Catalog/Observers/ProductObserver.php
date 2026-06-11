<?php

namespace App\Domains\Catalog\Observers;

use App\Domains\Catalog\Models\Product;
use App\Domains\Catalog\Jobs\IndexProductJob;

/**
 * ProductObserver
 *
 * Watches for Product model events and dispatches async MeiliSearch
 * index updates. Every product create/update/delete triggers a background
 * job to keep the search index in sync with PostgreSQL.
 *
 * Register in AppServiceProvider::boot():
 *   Product::observe(ProductObserver::class);
 */
class ProductObserver
{
    /**
     * After a product is created, index it in MeiliSearch.
     */
    public function created(Product $product): void
    {
        IndexProductJob::dispatch($product->id, 'upsert');
    }

    /**
     * After a product is updated, re-index it in MeiliSearch.
     */
    public function updated(Product $product): void
    {
        IndexProductJob::dispatch($product->id, 'upsert');
    }

    /**
     * After a product is deleted (soft-deactivated), remove from MeiliSearch.
     */
    public function deleted(Product $product): void
    {
        IndexProductJob::dispatch($product->id, 'delete');
    }
}
