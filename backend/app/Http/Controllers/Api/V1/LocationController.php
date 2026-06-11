<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Catalog\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

/**
 * LocationController
 *
 * Manages the physical warehouse location tree (Floor → Section → Aisle → Bin).
 * Tree responses are Redis-cached.
 */
class LocationController extends Controller
{
    public function tree(): JsonResponse
    {
        $tree = Cache::remember('locations:tree', 3600, function () {
            return Location::buildTree();
        });

        return response()->json([
            'success' => true,
            'data'    => $tree,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function index(): JsonResponse
    {
        $locations = Location::with('parent:id,name,code')
            ->active()
            ->orderBy('type')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $locations,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage locations.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:100',
            'code'           => 'required|string|max:30|unique:locations,code',
            'type'           => 'required|in:floor,section,aisle,bin',
            'parent_id'      => 'nullable|exists:locations,id',
            'capacity_units' => 'nullable|integer|min:0',
        ]);

        $location = Location::create($validated);
        Cache::forget('locations:tree');

        return response()->json([
            'success' => true,
            'data'    => $location,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $location = Location::with('childrenRecursive', 'parent')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $location,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage locations.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $location = Location::findOrFail($id);
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:100',
            'capacity_units' => 'nullable|integer|min:0',
            'is_active'      => 'sometimes|boolean',
        ]);

        $location->update($validated);
        Cache::forget('locations:tree');

        return response()->json([
            'success' => true,
            'data'    => $location->fresh(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage locations.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $location = Location::findOrFail($id);

        if ($location->children()->exists()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'HAS_CHILDREN', 'message' => 'Cannot delete location with sub-locations.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $location->delete();
        Cache::forget('locations:tree');

        return response()->json([
            'success' => true,
            'data'    => ['message' => 'Location deleted.'],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
