/**
 * SyncQueueScreen — Neumorphic Offline Sync Manager
 * 
 * Displays:
 * - Connection status (Online/Offline indicator) using NetInfo
 * - Number of pending transactions in local WatermelonDB offline queue
 * - List of detailed offline movements parsed from queue payloads
 * - Manual trigger sync action with rotation animations during execution
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, Easing, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmCard from '../../components/NmCard';
import database from '../../db';
import { syncDatabase } from '../../db/sync';
import { useSyncStore } from '../../stores/useSyncStore';

interface QueuedItem {
  id: string;
  clientUuid: string;
  actionType: string;
  status: string;
  createdAt: number;
  errorMessage: string | null;
  parsedPayload: {
    sku?: string;
    qty?: number | string;
    type?: string;
    notes?: string;
  };
}

export default function SyncQueueScreen() {
  const navigation = useNavigation<any>();
  const [isOnline, setIsOnline] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { isSyncing, getTimeSinceLastSync, lastSyncAt } = useSyncStore();
  const spinValue = React.useRef(new Animated.Value(0)).current;

  // Track network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      setConnectionType(state.type);
    });
    return () => unsubscribe();
  }, []);

  // Fetch local queued items from WatermelonDB
  const fetchQueue = async () => {
    try {
      setRefreshing(true);
      const collection = database.get('offline_queue');
      const records = await collection.query().fetch();
      
      const mapped: QueuedItem[] = records.map((record: any) => {
        let parsed = {};
        try {
          parsed = JSON.parse(record._raw.payload);
        } catch (e) {
          console.error('Failed to parse payload', e);
        }
        return {
          id: record.id,
          clientUuid: record._raw.client_uuid,
          actionType: record._raw.action_type,
          status: record._raw.status,
          createdAt: record._raw.created_at,
          errorMessage: record._raw.error_message || null,
          parsedPayload: parsed,
        };
      });
      
      setQueuedItems(mapped);
      // Keep store count in sync
      const pendingCount = mapped.filter(item => item.status === 'queued').length;
      useSyncStore.getState().setQueuedCount(pendingCount);
    } catch (error) {
      console.error('Failed to fetch offline queue:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [isSyncing, lastSyncAt]);

  // Handle rotate animation for sync icon
  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isSyncing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'You are currently offline. Please connect to the internet to sync with the server.');
      return;
    }
    await syncDatabase(database);
    await fetchQueue();
  };

  const getMovementTypeLabel = (type?: string) => {
    if (!type) return 'MOVEMENT';
    return type.toUpperCase();
  };

  const getTypeGradient = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'INWARD': return [colors.successStart, colors.successEnd];
      case 'OUTWARD': return [colors.dangerStart, colors.dangerEnd];
      case 'TRANSFER': return [colors.infoStart, colors.infoEnd];
      default: return [colors.primaryStart, colors.primaryEnd];
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryStart} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>GargEnterprises</Text>
        </View>
        <TouchableOpacity style={{ padding: spacing.xs }} onPress={fetchQueue}>
          <Ionicons name="refresh" size={24} color={colors.primaryStart} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={queuedItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.xxl }}>
            {/* Header Text */}
            <View style={styles.headerTitleWrap}>
              <Text style={typography.display}>Offline Sync Manager</Text>
              <Text style={styles.subtitle}>Track pending database sync events.</Text>
            </View>

            {/* Network Connection Status Card */}
            <NmCard variant="md" style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isOnline ? '#48BB78' : '#F56565' }
                  ]} />
                  <View>
                    <Text style={typography.titleSmall}>
                      Network State: {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </Text>
                    <Text style={styles.statusSubText}>
                      {isOnline ? `Connected via ${connectionType.toUpperCase()}` : 'Data updates queued locally'}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isOnline ? 'cloud-done' : 'cloud-offline'}
                  size={28}
                  color={isOnline ? '#48BB78' : '#F56565'}
                />
              </View>
            </NmCard>

            {/* Queue Statistics Card */}
            <NmCard variant="md" style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>QUEUED ACTION COUNT</Text>
                  <Text style={styles.statValue}>
                    {queuedItems.filter(item => item.status === 'queued').length}
                  </Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: colors.baseDk }]}>
                  <Text style={styles.statLabel}>LAST SYNC UPDATE</Text>
                  <Text style={styles.statValueText}>{getTimeSinceLastSync()}</Text>
                </View>
              </View>
            </NmCard>

            {/* Sync Action Button */}
            <TouchableOpacity
              style={[styles.syncBtn, shadows.primaryBtn]}
              onPress={handleSync}
              disabled={isSyncing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primaryStart, colors.primaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.syncBtnGradient}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sync" size={20} color={colors.white} />
                  </Animated.View>
                )}
                <Text style={styles.syncBtnText}>
                  {isSyncing ? 'Syncing Server Deltas...' : 'Synchronize Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[typography.overline, { marginTop: spacing.xxl }]}>
              PENDING OFFLINE LEDGER UPDATES
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NmCard variant="md" style={styles.movementCard}>
            <View style={styles.movementHeader}>
              <LinearGradient
                colors={getTypeGradient(item.parsedPayload.type) as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.movementBadge}
              >
                <Text style={styles.movementBadgeText}>
                  {getMovementTypeLabel(item.parsedPayload.type)}
                </Text>
              </LinearGradient>
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            </View>

            <View style={styles.itemDetail}>
              <Text style={styles.itemTitle}>{item.parsedPayload.sku || 'Unknown SKU'}</Text>
              <Text style={styles.itemSku}>UUID: {item.clientUuid.slice(0, 8)}...</Text>
              {item.parsedPayload.notes ? (
                <Text style={styles.notesText}>{item.parsedPayload.notes}</Text>
              ) : null}
            </View>

            <View style={styles.movementFooter}>
              <View style={styles.infoRow}>
                <Ionicons name="cube" size={16} color={colors.textPlaceholder} />
                <Text style={styles.qtyText}>Qty: {item.parsedPayload.qty || 1}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[
                  styles.dotBadge,
                  {
                    backgroundColor:
                      item.status === 'synced' ? '#48BB78' :
                      item.status === 'queued' ? '#ECC94B' : '#F56565'
                  }
                ]} />
                <Text style={styles.statusLabel}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {item.errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{item.errorMessage}</Text>
              </View>
            ) : null}
          </NmCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, shadows.raise]}>
              <Ionicons name="checkmark-circle" size={44} color="#48BB78" />
            </View>
            <Text style={typography.title}>Sync Queue is Empty</Text>
            <Text style={styles.emptySubText}>
              All offline transactions have successfully synced with the master inventory database.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.base,
    zIndex: 10,
    ...shadows.raise,
  },
  topBarTitle: { ...typography.titleLarge, color: colors.primaryStart },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  headerTitleWrap: { marginBottom: spacing.xl },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },

  // Status Card
  statusCard: { borderRadius: borderRadius.md, marginBottom: spacing.lg },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  statusSubText: { ...typography.caption, color: colors.textSubtle, marginTop: 2 },

  // Stats Card
  statsCard: { borderRadius: borderRadius.md, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', width: '100%' },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs },
  statLabel: { ...typography.overline, color: colors.textSubtle, fontSize: 9 },
  statValue: { fontFamily: 'monospace', fontSize: 24, fontWeight: '800', color: colors.primaryStart, marginTop: 4 },
  statValueText: { ...typography.titleSmall, color: colors.textPrimary, marginTop: 4 },

  // Sync Btn
  syncBtn: { height: 56, borderRadius: borderRadius.sm, overflow: 'hidden' },
  syncBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  syncBtnText: { ...typography.titleSmall, color: colors.white },

  // List Cards
  movementCard: { borderRadius: borderRadius.md, marginBottom: spacing.md },
  movementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  movementBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.xs },
  movementBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  timeText: { ...typography.caption, color: colors.textSubtle },

  itemDetail: { marginBottom: spacing.md },
  itemTitle: { ...typography.titleSmall, color: colors.textPrimary },
  itemSku: { ...typography.mono, fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  notesText: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.xs },

  movementFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  dotBadge: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { ...typography.overline, fontSize: 9, color: colors.textSecondary },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FED7D7',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  errorText: { ...typography.caption, color: '#C53030', flex: 1 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.hero * 2 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptySubText: { ...typography.caption, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
});
