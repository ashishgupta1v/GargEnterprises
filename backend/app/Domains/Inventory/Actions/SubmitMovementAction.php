<?php

namespace App\Domains\Inventory\Actions;

use App\Domains\Inventory\Models\StockMovement;
use App\Domains\Audit\Services\AuditLogService;
use App\Domains\Identity\Models\User;

/**
 * SubmitMovementAction
 *
 * Creates a new stock movement record. The status depends on the
 * submitting user's role:
 *
 * - Owner → status = 'approved' (auto-approve, triggers immediate stock update)
 * - Manager/Godown → status = 'pending' (queued for Owner approval)
 * - Staff → blocked (no permission to submit movements)
 */
class SubmitMovementAction
{
    public function __construct(
        private ProcessApprovalAction $approvalAction,
        private AuditLogService $auditService,
    ) {}

    /**
     * Submit a stock movement.
     *
     * @param array{
     *     product_id: int,
     *     movement_type: string,
     *     qty: float,
     *     from_location_id?: int|null,
     *     to_location_id?: int|null,
     *     photo_url?: string|null,
     * } $data
     * @param User $submitter
     *
     * @return StockMovement
     */
    public function execute(array $data, User $submitter): StockMovement
    {
        // Determine initial status based on role
        $status = $submitter->canDirectApprove() ? 'approved' : 'pending';

        // Create the movement record
        $movement = StockMovement::create([
            'product_id'       => $data['product_id'],
            'from_location_id' => $data['from_location_id'] ?? null,
            'to_location_id'   => $data['to_location_id'] ?? null,
            'qty'              => $data['qty'],
            'movement_type'    => $data['movement_type'],
            'status'           => $status,
            'submitted_by'     => $submitter->id,
            'approved_by'      => $status === 'approved' ? $submitter->id : null,
            'photo_url'        => $data['photo_url'] ?? null,
            'submitted_at'     => now(),
            'processed_at'     => $status === 'approved' ? now() : null,
        ]);

        // Audit log
        $this->auditService->logMovementSubmitted(
            userId: $submitter->id,
            movementId: $movement->id,
            movementData: $movement->toArray(),
        );

        // If Owner submitted → auto-approve (triggers stock update)
        if ($status === 'approved') {
            $this->approvalAction->approve($movement->id, $submitter);
        }

        // If pending → TODO: dispatch FCM notification to Owner
        // event(new StockMovementSubmitted($movement));

        return $movement->fresh();
    }
}
