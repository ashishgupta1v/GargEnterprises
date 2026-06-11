/**
 * Sync Store — Zustand
 *
 * Tracks offline sync state: last sync timestamp, syncing status,
 * queued item count, and error messages.
 */
import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: number | null;
  queuedCount: number;
  syncError: string | null;

  // Actions
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  setQueuedCount: (count: number) => void;
  setSyncError: (error: string | null) => void;

  // Computed
  getTimeSinceLastSync: () => string;
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  isSyncing: false,
  lastSyncAt: null,
  queuedCount: 0,
  syncError: null,

  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),
  setQueuedCount: (count) => set({ queuedCount: count }),
  setSyncError: (error) => set({ syncError: error }),

  getTimeSinceLastSync: () => {
    const lastSync = get().lastSyncAt;
    if (!lastSync) return 'Never synced';

    const diffMs = Date.now() - lastSync;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ${diffMin % 60}m ago`;
  },
}));

export default useSyncStore;
