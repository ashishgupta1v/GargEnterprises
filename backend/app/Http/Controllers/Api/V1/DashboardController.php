<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Inventory\Models\InventoryStock;
use App\Domains\Inventory\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

/**
 * DashboardController
 *
 * Owner-only dashboard with at-a-glance metrics.
 */
class DashboardController extends Controller
{
    /**
     * GET /v1/dashboard/owner
     *
     * Real-time dashboard: pending count, alerts, stock value by category.
     */
    public function owner(Request $request): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Owner-only dashboard.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $pendingCount = StockMovement::where('status', 'pending')->count();
        $outOfStockCount = InventoryStock::outOfStock()->count();
        $lowStockCount = InventoryStock::lowStock()->count();
        $deadStockCount = InventoryStock::deadStock()->count();

        $totalProducts = DB::table('products')->where('status', 'active')->count();
        $totalLocations = DB::table('locations')->where('is_active', true)->count();

        // Stock summary by category
        $stockByCategory = DB::table('inventory_stock')
            ->join('products', 'inventory_stock.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.status', 'active')
            ->select(
                'categories.name as category_name',
                DB::raw('COUNT(DISTINCT inventory_stock.product_id) as product_count'),
                DB::raw('SUM(inventory_stock.qty_on_hand) as total_qty'),
            )
            ->groupBy('categories.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // Recent movements
        $recentMovements = StockMovement::with([
            'product:id,sku_code,product_name',
            'submitter:id,name',
        ])
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'metrics' => [
                    'pending_approvals'  => $pendingCount,
                    'out_of_stock_count' => $outOfStockCount,
                    'low_stock_count'    => $lowStockCount,
                    'dead_stock_count'   => $deadStockCount,
                    'total_active_skus'  => $totalProducts,
                    'total_locations'    => $totalLocations,
                ],
                'stock_by_category'  => $stockByCategory,
                'recent_movements'   => $recentMovements,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
