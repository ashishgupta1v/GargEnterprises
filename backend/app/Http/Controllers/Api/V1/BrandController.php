<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Catalog\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

/**
 * BrandController — Brand master CRUD. Owner only for mutations.
 */
class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::withCount('products')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data'    => $brands,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage brands.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'logo_url'      => 'nullable|url',
            'is_authorised' => 'sometimes|boolean',
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $brand,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $brand,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage brands.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $brand = Brand::findOrFail($id);
        $validated = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'logo_url'      => 'nullable|url',
            'is_authorised' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $brand->fresh(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage brands.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $brand = Brand::findOrFail($id);

        if ($brand->products()->exists()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'HAS_PRODUCTS', 'message' => 'Cannot delete brand with assigned products.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $brand->delete();

        return response()->json([
            'success' => true,
            'data'    => ['message' => 'Brand deleted.'],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
