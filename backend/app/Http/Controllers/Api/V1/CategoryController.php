<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Catalog\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * CategoryController
 *
 * Manages the 4-level hierarchical category tree.
 * Tree responses are Redis-cached (invalidated on mutation).
 */
class CategoryController extends Controller
{
    /**
     * GET /v1/categories/tree
     *
     * Full category hierarchy as nested JSON. Redis-cached for < 400ms SLA.
     */
    public function tree(): JsonResponse
    {
        $tree = Cache::remember('categories:tree', 3600, function () {
            return Category::buildTree();
        });

        return response()->json([
            'success'   => true,
            'data'      => $tree,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * GET /v1/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::with('parent:id,name')
            ->orderBy('level')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $categories,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * POST /v1/categories — Owner only
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage categories.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $validated = $request->validate([
            'name'       => 'required|string|max:150',
            'parent_id'  => 'nullable|exists:categories,id',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        // Compute level and path
        $parent = $validated['parent_id'] ? Category::find($validated['parent_id']) : null;
        $level = $parent ? $parent->level + 1 : 1;

        if ($level > 4) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'MAX_DEPTH', 'message' => 'Category tree cannot exceed 4 levels.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $slug = Str::slug($validated['name']);
        $path = $parent ? $parent->path . '.' . $slug : $slug;

        $category = Category::create([
            'name'       => $validated['name'],
            'slug'       => $slug,
            'parent_id'  => $validated['parent_id'] ?? null,
            'level'      => $level,
            'path'       => $path,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'data'    => $category,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    /**
     * GET /v1/categories/{id}
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::with('childrenRecursive', 'parent')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $category,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * PUT /v1/categories/{id} — Owner only
     */
    public function update(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage categories.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:150',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'data'    => $category->fresh(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * DELETE /v1/categories/{id} — Owner only
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isOwner()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'FORBIDDEN', 'message' => 'Only Owner can manage categories.', 'http_status' => 403],
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        $category = Category::findOrFail($id);

        if ($category->children()->exists()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'HAS_CHILDREN', 'message' => 'Cannot delete category with subcategories.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        if ($category->products()->exists()) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'HAS_PRODUCTS', 'message' => 'Cannot delete category with assigned products.', 'http_status' => 422],
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $category->delete();
        Cache::forget('categories:tree');

        return response()->json([
            'success' => true,
            'data'    => ['message' => 'Category deleted.'],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
