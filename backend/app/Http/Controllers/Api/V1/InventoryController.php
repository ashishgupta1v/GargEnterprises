<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Inventory\Models\InventoryStock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

/**
 * InventoryController
 *
 * Handles stock level queries, alert listings, and report generation.
 */
class InventoryController extends Controller
{
    /**
     * GET /v1/inventory/stock
     *
     * Stock levels with filters: product_id, location_id, status_flag.
     */
    public function stock(Request $request): JsonResponse
    {
        $query = InventoryStock::with([
            'product:id,sku_code,product_name,reorder_point',
            'location:id,name,code',
        ]);

        if ($request->filled('product_id')) {
            $query->byProduct((int) $request->input('product_id'));
        }
        if ($request->filled('location_id')) {
            $query->byLocation((int) $request->input('location_id'));
        }
        if ($request->filled('status_flag')) {
            $query->where('status_flag', $request->input('status_flag'));
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $stock = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $stock->items(),
            'meta'    => [
                'current_page' => $stock->currentPage(),
                'last_page'    => $stock->lastPage(),
                'total'        => $stock->total(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/inventory/alerts
     *
     * All active alert items: out-of-stock, low-stock, dead-stock, pending count.
     * Access: Owner, Manager.
     */
    public function alerts(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('owner', 'manager')) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Insufficient permissions.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $outOfStock = InventoryStock::outOfStock()
            ->with('product:id,sku_code,product_name')
            ->get();

        $lowStock = InventoryStock::lowStock()
            ->with('product:id,sku_code,product_name,reorder_point')
            ->get();

        $deadStock = InventoryStock::deadStock()
            ->with('product:id,sku_code,product_name')
            ->get();

        $pendingCount = DB::table('stock_movements')
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'out_of_stock' => [
                    'count' => $outOfStock->count(),
                    'items' => $outOfStock->take(20),
                ],
                'low_stock' => [
                    'count' => $lowStock->count(),
                    'items' => $lowStock->take(20),
                ],
                'dead_stock' => [
                    'count' => $deadStock->count(),
                    'items' => $deadStock->take(20),
                ],
                'pending_approvals' => $pendingCount,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/inventory/reports/{type}
     *
     * Report types: dead-stock, low-stock, valuation, movement-history.
     * Access: Owner, Manager.
     */
    public function report(Request $request, string $type): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('owner', 'manager')) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Insufficient permissions.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $allowedTypes = ['dead-stock', 'low-stock', 'valuation', 'movement-history'];
        if (!in_array($type, $allowedTypes)) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'INVALID_REPORT', 'message' => "Report type must be: " . implode(', ', $allowedTypes), 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $data = match ($type) {
            'dead-stock' => InventoryStock::deadStock()
                ->with('product:id,sku_code,product_name', 'location:id,name,code')
                ->get(),
            'low-stock' => InventoryStock::lowStock()
                ->with('product:id,sku_code,product_name,reorder_point', 'location:id,name,code')
                ->get(),
            'valuation' => InventoryStock::with('product:id,sku_code,product_name', 'location:id,name,code')
                ->where('qty_on_hand', '>', 0)
                ->get(),
            'movement-history' => DB::table('stock_movements')
                ->join('products', 'stock_movements.product_id', '=', 'products.id')
                ->join('users', 'stock_movements.submitted_by', '=', 'users.id')
                ->select(
                    'stock_movements.*',
                    'products.sku_code',
                    'products.product_name',
                    'users.name as submitter_name',
                )
                ->orderBy('stock_movements.submitted_at', 'desc')
                ->limit(500)
                ->get(),
        };

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => ['report_type' => $type, 'generated_at' => now()->toISOString()],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
