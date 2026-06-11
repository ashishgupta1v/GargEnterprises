<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Catalog\Models\Product;
use App\Domains\Catalog\Models\Category;
use App\Domains\Catalog\Models\Brand;
use App\Domains\Catalog\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * SyncController
 *
 * Mobile offline sync endpoints. Supports WatermelonDB pull (delta) and push (offline queue upload).
 *
 * Pull: GET /v1/sync/pull?last_pulled_at={timestamp}
 *   Returns all records created/updated/deleted since the given timestamp.
 *   First sync (last_pulled_at=0) returns the entire catalogue.
 *
 * Push: POST /v1/sync/push
 *   Accepts batched offline actions (movements) queued on the mobile device.
 */
class SyncController extends Controller
{
    /**
     * GET /v1/sync/pull?last_pulled_at={timestamp}
     *
     * Delta sync for WatermelonDB. Returns changes since last pull.
     */
    public function pull(Request $request): JsonResponse
    {
        $lastPulledAt = (int) $request->input('last_pulled_at', 0);
        $since = $lastPulledAt > 0
            ? \Carbon\Carbon::createFromTimestamp($lastPulledAt)
            : \Carbon\Carbon::createFromTimestamp(0);

        $changes = [
            'products' => [
                'created' => Product::where('created_at', '>', $since)
                    ->with('brand:id,name', 'category:id,name')
                    ->get(),
                'updated' => $lastPulledAt > 0
                    ? Product::where('updated_at', '>', $since)
                        ->where('created_at', '<=', $since)
                        ->with('brand:id,name', 'category:id,name')
                        ->get()
                    : [],
                'deleted' => [], // Soft-deactivate only, handled via status filter
            ],
            'categories' => [
                'created' => Category::where('created_at', '>', $since)->get(),
                'updated' => [],
                'deleted' => [],
            ],
            'brands' => [
                'created' => Brand::where('created_at', '>', $since)->get(),
                'updated' => $lastPulledAt > 0
                    ? Brand::where('updated_at', '>', $since)
                        ->where('created_at', '<=', $since)
                        ->get()
                    : [],
                'deleted' => [],
            ],
            'locations' => [
                'created' => Location::where('created_at', '>', $since)->get(),
                'updated' => [],
                'deleted' => [],
            ],
        ];

        return response()->json([
            'success' => true,
            'data'    => [
                'changes'   => $changes,
                'timestamp' => now()->timestamp,
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/sync/push
     *
     * Upload offline-queued movements from the mobile device.
     * Each movement is tagged with a client-generated UUID to prevent duplicates.
     */
    public function push(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movements'                      => 'required|array',
            'movements.*.client_uuid'        => 'required|string|uuid',
            'movements.*.product_id'         => 'required|exists:products,id',
            'movements.*.movement_type'      => 'required|in:inward,outward,transfer,write_off',
            'movements.*.qty'                => 'required|numeric|gt:0',
            'movements.*.from_location_id'   => 'nullable|exists:locations,id',
            'movements.*.to_location_id'     => 'nullable|exists:locations,id',
        ]);

        $results = [];
        $user = $request->user();
        $submitAction = app(\App\Domains\Inventory\Actions\SubmitMovementAction::class);

        foreach ($validated['movements'] as $movementData) {
            try {
                $movement = $submitAction->execute($movementData, $user);
                $results[] = [
                    'client_uuid' => $movementData['client_uuid'],
                    'server_id'   => $movement->id,
                    'status'      => $movement->status,
                    'synced'      => true,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'client_uuid' => $movementData['client_uuid'],
                    'server_id'   => null,
                    'status'      => 'error',
                    'synced'      => false,
                    'error'       => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => ['results' => $results],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
