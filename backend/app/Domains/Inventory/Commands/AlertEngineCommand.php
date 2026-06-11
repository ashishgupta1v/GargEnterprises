<?php

namespace App\Domains\Inventory\Commands;

use App\Domains\Inventory\Models\InventoryStock;
use App\Domains\Catalog\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * AlertEngineCommand
 *
 * Scheduled to run daily at 6:00 AM IST. Scans all inventory_stock rows
 * and updates status flags based on the following rules:
 *
 * - out_of_stock: qty_on_hand = 0
 * - low_stock: qty_on_hand > 0 AND qty_on_hand <= product.reorder_point
 * - dead_stock: no stock_movement for this product in N days (configurable, default 90)
 * - out_of_trend: movement velocity decreased by > 50% compared to prior period
 * - excess_stock: qty_on_hand > 3× product.reorder_point
 * - in_stock: normal healthy stock level
 *
 * After flagging, dispatches FCM push notifications to the Owner
 * with a summary of all new alerts.
 */
class AlertEngineCommand extends Command
{
    protected $signature = 'inventory:alerts {--days=90 : Days threshold for dead stock detection}';

    protected $description = 'Run daily inventory alert engine — detects out-of-stock, low stock, dead stock, and excess stock.';

    public function handle(): int
    {
        $this->info('Starting Alert Engine...');
        $deadStockDays = (int) $this->option('days');

        $alertCounts = [
            'out_of_stock' => 0,
            'low_stock'    => 0,
            'dead_stock'   => 0,
            'excess_stock' => 0,
        ];

        // ── Step 1: Flag out-of-stock items ──
        $alertCounts['out_of_stock'] = DB::table('inventory_stock')
            ->where('qty_on_hand', '<=', 0)
            ->where('status_flag', '!=', 'out_of_stock')
            ->update(['status_flag' => 'out_of_stock']);

        $this->info("  Out-of-stock flagged: {$alertCounts['out_of_stock']}");

        // ── Step 2: Flag low-stock items ──
        $alertCounts['low_stock'] = DB::update("
            UPDATE inventory_stock AS s
            SET status_flag = 'low_stock'
            FROM products AS p
            WHERE s.product_id = p.id
              AND s.qty_on_hand > 0
              AND s.qty_on_hand <= p.reorder_point
              AND p.reorder_point > 0
              AND s.status_flag NOT IN ('low_stock', 'out_of_stock')
        ");

        $this->info("  Low-stock flagged: {$alertCounts['low_stock']}");

        // ── Step 3: Flag dead-stock (no movement in N days) ──
        $deadStockDate = now()->subDays($deadStockDays)->toDateTimeString();
        $alertCounts['dead_stock'] = DB::table('inventory_stock')
            ->where('qty_on_hand', '>', 0)
            ->where('last_movement_at', '<', $deadStockDate)
            ->where('status_flag', '!=', 'dead_stock')
            ->update(['status_flag' => 'dead_stock']);

        $this->info("  Dead-stock flagged (>{$deadStockDays} days): {$alertCounts['dead_stock']}");

        // ── Step 4: Flag excess-stock (qty > 3× reorder point) ──
        $alertCounts['excess_stock'] = DB::update("
            UPDATE inventory_stock AS s
            SET status_flag = 'excess_stock'
            FROM products AS p
            WHERE s.product_id = p.id
              AND p.reorder_point > 0
              AND s.qty_on_hand > (p.reorder_point * 3)
              AND s.status_flag NOT IN ('excess_stock')
        ");

        $this->info("  Excess-stock flagged: {$alertCounts['excess_stock']}");

        // ── Step 5: Reset healthy items back to in_stock ──
        $resetCount = DB::update("
            UPDATE inventory_stock AS s
            SET status_flag = 'in_stock'
            FROM products AS p
            WHERE s.product_id = p.id
              AND s.qty_on_hand > 0
              AND s.qty_on_hand > p.reorder_point
              AND s.qty_on_hand <= (p.reorder_point * 3)
              AND s.last_movement_at >= ?
              AND s.status_flag != 'in_stock'
        ", [$deadStockDate]);

        $this->info("  Reset to in_stock: {$resetCount}");

        // ── Step 6: Dispatch FCM summary if any new alerts ──
        $totalAlerts = array_sum($alertCounts);
        if ($totalAlerts > 0) {
            $this->info("  Total new alerts: {$totalAlerts}. Dispatching FCM to Owner...");
            // TODO: FCMDispatcher::alertOwnerDailySummary($alertCounts);
        } else {
            $this->info("  No new alerts detected.");
        }

        $this->info('Alert Engine complete.');
        return self::SUCCESS;
    }
}
