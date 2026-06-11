<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Inventory\Actions\SubmitMovementAction;
use App\Domains\Inventory\Actions\ProcessApprovalAction;
use App\Domains\Inventory\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * MovementController
 *
 * Handles stock movement submission, approval queue, and approval/rejection.
 * Implements the Maker-Checker workflow for inventory integrity.
 */
class MovementController extends Controller
{
    public function __construct(
        private SubmitMovementAction $submitAction,
        private ProcessApprovalAction $approvalAction,
    ) {}

    /**
     * POST /v1/inventory/movements
     *
     * Submit a stock movement. Owner = auto-approve, Others = pending.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // RBAC: Staff cannot submit movements
        if ($user->isStaff()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Staff cannot submit stock movements.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'movement_type'    => 'required|in:inward,outward,transfer,write_off,reserve,release',
            'qty'              => 'required|numeric|gt:0',
            'from_location_id' => 'required_if:movement_type,outward,transfer,write_off,reserve,release|exists:locations,id',
            'to_location_id'   => 'required_if:movement_type,inward,transfer|exists:locations,id',
            'photo_url'        => 'nullable|url',
        ]);

        $movement = $this->submitAction->execute($validated, $user);

        return response()->json([
            'success' => true,
            'data'    => $movement->load(['product:id,sku_code,product_name', 'submitter:id,name']),
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    /**
     * GET /v1/inventory/movements/pending
     *
     * Owner-only: list all pending movements awaiting approval.
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can view pending movements.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);

        $pending = StockMovement::pending()
            ->with([
                'product:id,sku_code,product_name',
                'fromLocation:id,name,code',
                'toLocation:id,name,code',
                'submitter:id,name,role',
            ])
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $pending->items(),
            'meta'    => [
                'current_page' => $pending->currentPage(),
                'last_page'    => $pending->lastPage(),
                'total'        => $pending->total(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/inventory/movements/{id}/approve
     *
     * Owner-only: approve a pending movement. Triggers atomic stock update.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can approve movements.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        try {
            $movement = $this->approvalAction->approve($id, $user);

            // TODO: Dispatch FCM notification to submitter

            return response()->json([
                'success' => true,
                'data'    => $movement->load(['product', 'submitter:id,name']),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'ALREADY_PROCESSED', 'message' => $e->getMessage(), 'http_status' => 409],
                'timestamp' => now()->toISOString(),
            ], 409);
        }
    }

    /**
     * POST /v1/inventory/movements/{id}/reject
     *
     * Owner-only: reject a pending movement with a reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can reject movements.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        try {
            $movement = $this->approvalAction->reject($id, $user, $validated['reason']);

            // TODO: Dispatch FCM notification with rejection reason to submitter

            return response()->json([
                'success' => true,
                'data'    => $movement->load(['product', 'submitter:id,name']),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'ALREADY_PROCESSED', 'message' => $e->getMessage(), 'http_status' => 409],
                'timestamp' => now()->toISOString(),
            ], 409);
        }
    }
}
