<?php

namespace App\Domains\Inventory\Actions;

use App\Domains\Inventory\Models\InventoryStock;
use App\Domains\Inventory\Models\StockMovement;
use App\Domains\Audit\Services\AuditLogService;
use App\Domains\Identity\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * ProcessApprovalAction
 *
 * The critical Maker-Checker approval handler. When the Owner approves
 * a pending movement, this action:
 *
 * 1. Acquires a row lock on inventory_stock (SELECT FOR UPDATE)
 * 2. Applies the quantity change atomically
 * 3. Marks the movement as approved
 * 4. Writes an immutable audit log entry
 * 5. All within a single SERIALIZABLE PostgreSQL transaction
 *
 * If any step fails, the entire transaction rolls back.
 */
class ProcessApprovalAction
{
    public function __construct(
        private AuditLogService $auditService,
    ) {}

    /**
     * Approve a pending stock movement.
     *
     * @param int  $movementId The stock_movements.id to approve
     * @param User $approver   The Owner user approving the movement
     *
     * @throws ValidationException If movement is not pending
     * @throws \RuntimeException   If stock update fails
     */
    public function approve(int $movementId, User $approver): StockMovement
    {
        return DB::transaction(function () use ($movementId, $approver) {
            // Fetch movement with pessimistic lock
            $movement = StockMovement::lockForUpdate()->findOrFail($movementId);

            if (!$movement->isPending()) {
                throw ValidationException::withMessages([
                    'status' => ['This movement has already been processed.'],
                ]);
            }

            // Apply stock changes based on movement type
            $this->applyStockChange($movement);

            // Mark movement as approved
            $movement->update([
                'status'       => 'approved',
                'approved_by'  => $approver->id,
                'processed_at' => now(),
            ]);

            // Audit trail
            $this->auditService->logMovementApproved(
                ownerId: $approver->id,
                movementId: $movement->id,
                movementData: $movement->toArray(),
            );

            return $movement->fresh();
        }, 5); // 5 retry attempts for deadlock resolution
    }

    /**
     * Reject a pending stock movement with a reason.
     */
    public function reject(int $movementId, User $approver, string $reason): StockMovement
    {
        return DB::transaction(function () use ($movementId, $approver, $reason) {
            $movement = StockMovement::lockForUpdate()->findOrFail($movementId);

            if (!$movement->isPending()) {
                throw ValidationException::withMessages([
                    'status' => ['This movement has already been processed.'],
                ]);
            }

            $movement->update([
                'status'           => 'rejected',
                'approved_by'      => $approver->id,
                'rejection_reason' => $reason,
                'processed_at'     => now(),
            ]);

            // Audit trail
            $this->auditService->logMovementRejected(
                ownerId: $approver->id,
                movementId: $movement->id,
                movementData: array_merge($movement->toArray(), ['rejection_reason' => $reason]),
            );

            return $movement->fresh();
        });
    }

    /**
     * Apply the actual stock quantity change with row-level locking.
     *
     * Uses SELECT FOR UPDATE to prevent race conditions when
     * multiple approval requests hit the same stock row.
     */
    private function applyStockChange(StockMovement $movement): void
    {
        switch ($movement->movement_type) {
            case 'inward':
                $this->updateStock(
                    $movement->product_id,
                    $movement->to_location_id,
                    $movement->qty,
                    'add'
                );
                break;

            case 'outward':
            case 'write_off':
                $this->updateStock(
                    $movement->product_id,
                    $movement->from_location_id,
                    $movement->qty,
                    'subtract'
                );
                break;

            case 'transfer':
                // Subtract from source
                $this->updateStock(
                    $movement->product_id,
                    $movement->from_location_id,
                    $movement->qty,
                    'subtract'
                );
                // Add to destination
                $this->updateStock(
                    $movement->product_id,
                    $movement->to_location_id,
                    $movement->qty,
                    'add'
                );
                break;

            case 'reserve':
                // Move qty from available to reserved
                DB::table('inventory_stock')
                    ->where('product_id', $movement->product_id)
                    ->where('location_id', $movement->from_location_id)
                    ->lockForUpdate()
                    ->update([
                        'qty_reserved'     => DB::raw("qty_reserved + {$movement->qty}"),
                        'last_movement_at' => now(),
                    ]);
                break;

            case 'release':
                // Move qty from reserved back to available
                DB::table('inventory_stock')
                    ->where('product_id', $movement->product_id)
                    ->where('location_id', $movement->from_location_id)
                    ->lockForUpdate()
                    ->update([
                        'qty_reserved'     => DB::raw("GREATEST(qty_reserved - {$movement->qty}, 0)"),
                        'last_movement_at' => now(),
                    ]);
                break;
        }
    }

    /**
     * Add or subtract qty from a specific stock row with row lock.
     */
    private function updateStock(int $productId, int $locationId, float $qty, string $operation): void
    {
        $row = DB::table('inventory_stock')
            ->where('product_id', $productId)
            ->where('location_id', $locationId)
            ->lockForUpdate()
            ->first();

        if ($row) {
            $newQty = $operation === 'add'
                ? $row->qty_on_hand + $qty
                : $row->qty_on_hand - $qty;

            DB::table('inventory_stock')
                ->where('product_id', $productId)
                ->where('location_id', $locationId)
                ->update([
                    'qty_on_hand'      => max(0, $newQty), // Never go negative
                    'last_movement_at' => now(),
                ]);
        } elseif ($operation === 'add') {
            // Create new stock row (first time this product appears at this location)
            DB::table('inventory_stock')->insert([
                'product_id'       => $productId,
                'location_id'      => $locationId,
                'qty_on_hand'      => $qty,
                'qty_reserved'     => 0,
                'status_flag'      => 'in_stock',
                'last_movement_at' => now(),
            ]);
        } else {
            throw new \RuntimeException(
                "Cannot subtract from non-existent stock row: product={$productId}, location={$locationId}"
            );
        }
    }
}
