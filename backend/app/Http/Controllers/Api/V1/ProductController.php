<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Catalog\Models\Product;
use App\Domains\Catalog\Models\Brand;
use App\Domains\Catalog\Models\Category;
use App\Domains\Audit\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * ProductController
 *
 * Handles all Catalog Module 1 endpoints: list, search, barcode lookup,
 * CRUD, bulk import, and photo upload. RBAC enforced via policies.
 */
class ProductController extends Controller
{
    public function __construct(
        private AuditLogService $auditService,
    ) {}

    /**
     * GET /v1/products
     *
     * Paginated product list with filters: brand_id, category_id, status, location_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand:id,name', 'category:id,name', 'primaryPhoto'])
            ->active();

        // Apply filters
        if ($request->filled('brand_id')) {
            $query->byBrand((int) $request->input('brand_id'));
        }
        if ($request->filled('category_id')) {
            $query->byCategory((int) $request->input('category_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sorting
        $sortField = $request->input('sort', 'product_name');
        $sortDir = $request->input('dir', 'asc');
        $allowedSorts = ['product_name', 'sku_code', 'created_at', 'updated_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $products->items(),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/products/search?q={query}
     *
     * MeiliSearch full-text search. Returns top 20 results sorted by relevance.
     * SLA: < 800ms E2E.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'timestamp' => now()->toISOString(),
            ]);
        }

        $meiliHost = config('services.meilisearch.host', 'http://meilisearch:7700');
        $meiliKey = config('services.meilisearch.key', 'masterKey');

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$meiliKey}",
        ])->post("{$meiliHost}/indexes/products/search", [
            'q'     => $query,
            'limit' => 20,
        ]);

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'SEARCH_ERROR', 'message' => 'Search service unavailable.'],
                'timestamp' => now()->toISOString(),
            ], 503);
        }

        $hits = $response->json('hits', []);

        return response()->json([
            'success'   => true,
            'data'      => $hits,
            'meta'      => [
                'query'         => $query,
                'total_hits'    => $response->json('estimatedTotalHits', 0),
                'processing_ms' => $response->json('processingTimeMs', 0),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/products/barcode/{code}
     *
     * Exact barcode/QR lookup. SLA: < 300ms online.
     */
    public function barcodeLookup(string $code): JsonResponse
    {
        $product = Product::with(['brand:id,name', 'category:id,name', 'photos', 'inventoryStocks.location:id,name,code'])
            ->where('barcode', $code)
            ->orWhere('sku_code', $code)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'        => 'PRODUCT_NOT_FOUND',
                    'message'     => "No product found for barcode: {$code}",
                    'http_status' => 404,
                ],
                'timestamp' => now()->toISOString(),
            ], 404);
        }

        return response()->json([
            'success'   => true,
            'data'      => $product,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/products/{id}
     *
     * Full product detail with photos, stock per location, and recent movement history.
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with([
            'brand',
            'category',
            'photos',
            'inventoryStocks.location',
            'stockMovements' => fn($q) => $q->orderBy('submitted_at', 'desc')->limit(20),
            'stockMovements.submitter:id,name',
        ])->findOrFail($id);

        return response()->json([
            'success'   => true,
            'data'      => $product,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/products
     *
     * Create new product. Owner = direct, Manager = pending.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // RBAC: Only Owner and Manager can create products
        if (!$user->hasRole('owner', 'manager')) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Insufficient permissions.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'sku_code'       => 'required|string|max:50|unique:products,sku_code',
            'barcode'        => 'nullable|string|max:100|unique:products,barcode',
            'product_name'   => 'required|string|max:255',
            'brand_id'       => 'required|exists:brands,id',
            'category_id'    => 'required|exists:categories,id',
            'uom_base'       => 'sometimes|string|max:20',
            'uom_conversion' => 'sometimes|numeric|min:0.0001',
            'reorder_point'  => 'sometimes|numeric|min:0',
            'hsn_code'       => 'nullable|string|max:20',
            'metadata'       => 'nullable|array',
        ]);

        // Manager submissions are tracked but go through as active for now
        // (full pending product workflow can be added later)
        $validated['status'] = 'active';

        $product = Product::create($validated);

        // Audit log
        $this->auditService->logProductCreated(
            userId: $user->id,
            productId: $product->id,
            productData: $product->toArray(),
        );

        return response()->json([
            'success'   => true,
            'data'      => $product->fresh(['brand', 'category']),
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    /**
     * PUT /v1/products/{id}
     *
     * Update product fields. Partial updates supported.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('owner', 'manager')) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Insufficient permissions.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $product = Product::findOrFail($id);
        $oldData = $product->toArray();

        $validated = $request->validate([
            'product_name'   => 'sometimes|string|max:255',
            'brand_id'       => 'sometimes|exists:brands,id',
            'category_id'    => 'sometimes|exists:categories,id',
            'uom_base'       => 'sometimes|string|max:20',
            'uom_conversion' => 'sometimes|numeric|min:0.0001',
            'reorder_point'  => 'sometimes|numeric|min:0',
            'hsn_code'       => 'nullable|string|max:20',
            'metadata'       => 'nullable|array',
        ]);

        $product->update($validated);

        // Audit log with diff
        $this->auditService->logProductUpdated(
            userId: $user->id,
            productId: $product->id,
            oldData: $oldData,
            newData: $product->fresh()->toArray(),
        );

        return response()->json([
            'success'   => true,
            'data'      => $product->fresh(['brand', 'category']),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * DELETE /v1/products/{id}/deactivate
     *
     * Soft-deactivate. Never hard deletes. Owner only.
     */
    public function deactivate(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only the Owner can deactivate products.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $product = Product::findOrFail($id);
        $product->update(['status' => 'inactive']);

        $this->auditService->log(
            userId: $user->id,
            action: 'product.deactivated',
            entityType: 'product',
            entityId: $product->id,
            oldValue: ['status' => 'active'],
            newValue: ['status' => 'inactive'],
        );

        return response()->json([
            'success'   => true,
            'data'      => ['message' => 'Product deactivated.'],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/products/import
     *
     * Excel/CSV bulk import. Returns job_id for progress polling.
     * Owner only.
     */
    public function import(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only the Owner can import products.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:20480', // 20MB max
        ]);

        // Store file and dispatch import job
        $path = $request->file('file')->store('imports', 'local');
        $jobId = uniqid('import_', true);

        // TODO: Dispatch ProcessImportBatchJob
        // ProcessImportBatchJob::dispatch($path, $jobId, $user->id);

        Cache::put("import_status:{$jobId}", [
            'status'   => 'queued',
            'progress' => 0,
            'total'    => 0,
            'errors'   => [],
        ], 3600); // 1 hour TTL

        return response()->json([
            'success' => true,
            'data'    => [
                'job_id'  => $jobId,
                'message' => 'Import queued. Poll /products/import/{job_id}/status for progress.',
            ],
            'timestamp' => now()->toISOString(),
        ], 202);
    }

    /**
     * GET /v1/products/import/{jobId}/status
     *
     * Poll import progress.
     */
    public function importStatus(string $jobId): JsonResponse
    {
        $status = Cache::get("import_status:{$jobId}");

        if (!$status) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'NOT_FOUND', 'message' => 'Import job not found.', 'http_status' => 404],
                'timestamp' => now()->toISOString(),
            ], 404);
        }

        return response()->json([
            'success'   => true,
            'data'      => $status,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/products/{id}/photos
     *
     * Upload product photo (max 5 per product).
     */
    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('owner', 'manager')) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Insufficient permissions.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $product = Product::findOrFail($id);

        // Check photo limit
        if ($product->photos()->count() >= 5) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'PHOTO_LIMIT', 'message' => 'Maximum 5 photos per product.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
        ]);

        // TODO: Upload to DO Spaces and generate thumbnail
        $path = $request->file('photo')->store("products/{$id}", 'public');
        $isPrimary = $product->photos()->count() === 0; // First photo is primary

        $photo = $product->photos()->create([
            'storage_url' => $path,
            'thumb_url'   => $path, // TODO: Generate actual thumbnail
            'is_primary'  => $isPrimary,
        ]);

        return response()->json([
            'success'   => true,
            'data'      => $photo,
            'timestamp' => now()->toISOString(),
        ], 201);
    }
}
