/**
 * SyncStatusBar — Neumorphic sync status indicator
 *
 * Shows sync state with neumorphic flat shadow styling.
 * Stub implementation until useSyncStore is built.
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, shadows } from '../theme';

const useSyncStub = () => ({
  isSyncing: false,
  queuedCount: 0,
  syncError: null as string | null,
  getTimeSinceLastSync: () => 'just now',
});

export default function SyncStatusBar() {
  const { isSyncing, queuedCount, syncError, getTimeSinceLastSync } = useSyncStub();
  const timeSince = getTimeSinceLastSync();

  if (!isSyncing && queuedCount === 0 && !syncError) {
    return (
      <View style={styles.bar}>
        <View style={[styles.dot, styles.dotOnline]} />
        <Text style={styles.text}>Synced · {timeSince}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bar, syncError ? styles.barError : isSyncing ? styles.barSyncing : styles.barQueued]}>
      {isSyncing ? (
        <>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={[styles.text, styles.textWhite]}>Syncing...</Text>
        </>
      ) : syncError ? (
        <>
          <View style={[styles.dot, styles.dotError]} />
          <Text style={[styles.text, styles.textWhite]}>Sync failed · {syncError}</Text>
        </>
      ) : (
        <>
          <View style={[styles.dot, styles.dotQueued]} />
          <Text style={styles.text}>{queuedCount} action{queuedCount !== 1 ? 's' : ''} queued</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.base,
    ...shadows.flat,
  },
  barSyncing: { backgroundColor: colors.primaryStart },
  barError: { backgroundColor: colors.dangerStart },
  barQueued: { backgroundColor: colors.base },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline: { backgroundColor: colors.success },
  dotError: { backgroundColor: colors.white },
  dotQueued: { backgroundColor: colors.warning },
  text: { fontSize: 11, fontWeight: '500', color: colors.textSubtle },
  textWhite: { color: colors.white },
});
