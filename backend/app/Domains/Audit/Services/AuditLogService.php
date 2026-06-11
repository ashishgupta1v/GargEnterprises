<?php

namespace App\Domains\Audit\Services;

use Illuminate\Support\Facades\DB;

/**
 * AuditLogService
 *
 * Append-only audit trail writer. All mutations in the system pass through
 * this service to record who did what, when, and what changed.
 *
 * The activity_log table has REVOKE UPDATE, DELETE enforced at the database
 * level — once a row is written, it is immutable forever.
 *
 * IMPORTANT: This service only performs INSERT operations. If an UPDATE
 * or DELETE is attempted on the activity_log table, PostgreSQL will reject
 * it with a permission error.
 */
class AuditLogService
{
    /**
     * Write an immutable audit entry.
     *
     * @param int|null    $userId     Who performed the action (null for system)
     * @param string      $action     e.g. "product.created", "movement.approved"
     * @param string      $entityType e.g. "product", "stock_movement", "user"
     * @param int         $entityId   ID of the affected entity
     * @param array|null  $oldValue   Previous state snapshot (JSONB)
     * @param array|null  $newValue   New state snapshot (JSONB)
     */
    public function log(
        ?int $userId,
        string $action,
        string $entityType,
        int $entityId,
        ?array $oldValue = null,
        ?array $newValue = null,
    ): void {
        DB::table('activity_log')->insert([
            'user_id'     => $userId,
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'old_value'   => $oldValue ? json_encode($oldValue) : null,
            'new_value'   => $newValue ? json_encode($newValue) : null,
            'created_at'  => now(),
        ]);
    }

    /**
     * Log a product creation event.
     */
    public function logProductCreated(int $userId, int $productId, array $productData): void
    {
        $this->log($userId, 'product.created', 'product', $productId, null, $productData);
    }

    /**
     * Log a product update event with diff.
     */
    public function logProductUpdated(int $userId, int $productId, array $oldData, array $newData): void
    {
        $this->log($userId, 'product.updated', 'product', $productId, $oldData, $newData);
    }

    /**
     * Log a stock movement submission.
     */
    public function logMovementSubmitted(int $userId, int $movementId, array $movementData): void
    {
        $this->log($userId, 'movement.submitted', 'stock_movement', $movementId, null, $movementData);
    }

    /**
     * Log a stock movement approval.
     */
    public function logMovementApproved(int $ownerId, int $movementId, array $movementData): void
    {
        $this->log($ownerId, 'movement.approved', 'stock_movement', $movementId, null, $movementData);
    }

    /**
     * Log a stock movement rejection.
     */
    public function logMovementRejected(int $ownerId, int $movementId, array $movementData): void
    {
        $this->log($ownerId, 'movement.rejected', 'stock_movement', $movementId, null, $movementData);
    }
}
