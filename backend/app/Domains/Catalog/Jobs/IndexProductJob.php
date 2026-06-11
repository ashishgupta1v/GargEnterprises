<?php

namespace App\Domains\Catalog\Jobs;

use App\Domains\Catalog\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * IndexProductJob
 *
 * Async queue job that syncs a single product to MeiliSearch.
 * Supports upsert (create/update) and delete operations.
 *
 * SLA: MeiliSearch re-index on product update completes in < 5 seconds.
 */
class IndexProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10; // seconds between retries

    public function __construct(
        private int $productId,
        private string $operation = 'upsert', // 'upsert' or 'delete'
    ) {
        $this->onQueue('search-index');
    }

    public function handle(): void
    {
        $meiliHost = config('services.meilisearch.host', 'http://meilisearch:7700');
        $meiliKey = config('services.meilisearch.key', 'masterKey');

        if ($this->operation === 'delete') {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$meiliKey}",
            ])->delete("{$meiliHost}/indexes/products/documents/{$this->productId}");

            if ($response->successful()) {
                Log::info("MeiliSearch: Deleted product {$this->productId}");
            } else {
                Log::warning("MeiliSearch: Failed to delete product {$this->productId}", [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }
            return;
        }

        // Upsert: fetch product and push to MeiliSearch
        $product = Product::with(['brand:id,name', 'category:id,name'])->find($this->productId);

        if (!$product) {
            Log::warning("MeiliSearch: Product {$this->productId} not found for indexing.");
            return;
        }

        $document = $product->toSearchableArray();

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$meiliKey}",
            'Content-Type'  => 'application/json',
        ])->post("{$meiliHost}/indexes/products/documents", [$document]);

        if ($response->successful()) {
            Log::info("MeiliSearch: Indexed product {$this->productId}");
        } else {
            Log::warning("MeiliSearch: Failed to index product {$this->productId}", [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            $this->fail(new \RuntimeException("MeiliSearch indexing failed for product {$this->productId}"));
        }
    }
}
