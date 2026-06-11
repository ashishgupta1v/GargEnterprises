/**
 * WatermelonDB Schema — Garg Enterprises Mobile
 *
 * Defines the local SQLite schema for offline-first catalogue caching.
 * Mirrors the PostgreSQL backend tables for products, categories, brands, locations.
 * Supports 26,000+ products on 2GB RAM Android devices.
 */
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // ── Products (26K+ records) ──
    tableSchema({
      name: 'products',
      columns: [
        { name: 'server_id', type: 'number', isIndexed: true },
        { name: 'sku_code', type: 'string', isIndexed: true },
        { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
        { name: 'product_name', type: 'string' },
        { name: 'brand_id', type: 'number', isIndexed: true },
        { name: 'brand_name', type: 'string', isOptional: true },
        { name: 'category_id', type: 'number', isIndexed: true },
        { name: 'category_name', type: 'string', isOptional: true },
        { name: 'uom_base', type: 'string' },
        { name: 'uom_conversion', type: 'number' },
        { name: 'reorder_point', type: 'number' },
        { name: 'hsn_code', type: 'string', isOptional: true },
        { name: 'metadata', type: 'string', isOptional: true }, // JSON string
        { name: 'status', type: 'string' },
        { name: 'primary_photo_url', type: 'string', isOptional: true },
        { name: 'total_stock', type: 'number' },
        { name: 'synced_at', type: 'number' }, // timestamp
      ],
    }),

    // ── Categories ──
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'server_id', type: 'number', isIndexed: true },
        { name: 'parent_id', type: 'number', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'level', type: 'number' },
        { name: 'sort_order', type: 'number' },
      ],
    }),

    // ── Brands ──
    tableSchema({
      name: 'brands',
      columns: [
        { name: 'server_id', type: 'number', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'is_authorised', type: 'boolean' },
      ],
    }),

    // ── Locations ──
    tableSchema({
      name: 'locations',
      columns: [
        { name: 'server_id', type: 'number', isIndexed: true },
        { name: 'parent_id', type: 'number', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
    }),

    // ── Offline Action Queue ──
    tableSchema({
      name: 'offline_queue',
      columns: [
        { name: 'client_uuid', type: 'string', isIndexed: true },
        { name: 'action_type', type: 'string' },   // 'movement', 'product_update'
        { name: 'payload', type: 'string' },        // JSON stringified
        { name: 'status', type: 'string' },          // 'queued', 'syncing', 'synced', 'failed'
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'error_message', type: 'string', isOptional: true },
      ],
    }),
  ],
});

export default schema;
