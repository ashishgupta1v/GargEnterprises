/**
 * Sync Service — WatermelonDB ↔ Laravel API
 *
 * Handles initial full sync (first launch), incremental delta sync
 * (every 10 min when online), and offline queue upload on reconnect.
 *
 * Flow:
 * 1. Pull: GET /sync/pull?last_pulled_at={timestamp}
 *    → Apply delta changes to local WatermelonDB
 * 2. Push: POST /sync/push { movements: [...queued] }
 *    → Upload offline-queued movements to server
 */
import { synchronize } from '@nozbe/watermelondb/sync';
import { Database } from '@nozbe/watermelondb';
import { api } from '../services/api';
import { useSyncStore } from '../stores/useSyncStore';

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Execute a full sync cycle (pull + push).
 */
export async function syncDatabase(database: Database): Promise<void> {
  const syncStore = useSyncStore.getState();

  try {
    syncStore.setSyncing(true);

    await synchronize({
      database,

      pullChanges: async ({ lastPulledAt }) => {
        const timestamp = lastPulledAt ?? 0;
        const response = await api.get('/sync/pull', {
          params: { last_pulled_at: timestamp },
        });

        if (!response.data.success) {
          throw new Error('Sync pull failed');
        }

        const { changes, timestamp: serverTimestamp } = response.data.data;

        return {
          changes: transformServerChanges(changes),
          timestamp: serverTimestamp,
        };
      },

      pushChanges: async ({ changes }) => {
        // Extract queued movements from offline queue
        const queuedMovements = await getQueuedMovements(database);

        if (queuedMovements.length > 0) {
          const response = await api.post('/sync/push', {
            movements: queuedMovements,
          });

          if (response.data.success) {
            await markMovementsSynced(database, response.data.data.results);
          }
        }
      },
    });

    syncStore.setLastSyncAt(Date.now());
    syncStore.setSyncError(null);
  } catch (error: any) {
    console.error('Sync failed:', error.message);
    syncStore.setSyncError(error.message);
  } finally {
    syncStore.setSyncing(false);
  }
}

/**
 * Transform server response format to WatermelonDB sync format.
 */
function transformServerChanges(serverChanges: any): any {
  const wmChanges: any = {};

  for (const [table, changes] of Object.entries(serverChanges) as any[]) {
    wmChanges[table] = {
      created: (changes.created || []).map((item: any) => ({
        id: `server_${item.id}`,
        server_id: item.id,
        ...flattenItem(table, item),
      })),
      updated: (changes.updated || []).map((item: any) => ({
        id: `server_${item.id}`,
        server_id: item.id,
        ...flattenItem(table, item),
      })),
      deleted: (changes.deleted || []).map((id: number) => `server_${id}`),
    };
  }

  return wmChanges;
}

/**
 * Flatten a server item into WatermelonDB column format.
 */
function flattenItem(table: string, item: any): any {
  if (table === 'products') {
    return {
      sku_code: item.sku_code,
      barcode: item.barcode,
      product_name: item.product_name,
      brand_id: item.brand_id,
      brand_name: item.brand?.name || item.brand_name || '',
      category_id: item.category_id,
      category_name: item.category?.name || item.category_name || '',
      uom_base: item.uom_base || 'pcs',
      uom_conversion: item.uom_conversion || 1,
      reorder_point: item.reorder_point || 0,
      hsn_code: item.hsn_code,
      metadata: item.metadata ? JSON.stringify(item.metadata) : null,
      status: item.status,
      primary_photo_url: item.primary_photo?.thumb_url || null,
      total_stock: item.total_stock || 0,
      synced_at: Date.now(),
    };
  }

  // Generic mapping for categories, brands, locations
  return { ...item, synced_at: Date.now() };
}

/**
 * Get all queued movements from the offline queue.
 */
async function getQueuedMovements(database: Database): Promise<any[]> {
  const collection = database.get('offline_queue');
  const queued = await collection.query().fetch();

  return queued
    .filter((item: any) => item.status === 'queued' && item.action_type === 'movement')
    .map((item: any) => ({
      client_uuid: item.client_uuid,
      ...JSON.parse(item.payload),
    }));
}

/**
 * Mark synced movements in the offline queue.
 */
async function markMovementsSynced(database: Database, results: any[]): Promise<void> {
  await database.write(async () => {
    const collection = database.get('offline_queue');
    for (const result of results) {
      if (result.synced) {
        const records = await collection
          .query()
          .fetch();

        const record = records.find((r: any) => r.client_uuid === result.client_uuid);
        if (record) {
          await record.update((r: any) => {
            r.status = 'synced';
            r.synced_at = Date.now();
          });
        }
      }
    }
  });
}

/**
 * Start background sync interval (every 10 minutes).
 */
export function startBackgroundSync(database: Database): NodeJS.Timeout {
  // Initial sync on start
  syncDatabase(database);

  // Recurring sync
  return setInterval(() => {
    syncDatabase(database);
  }, SYNC_INTERVAL_MS);
}

export default { syncDatabase, startBackgroundSync };
