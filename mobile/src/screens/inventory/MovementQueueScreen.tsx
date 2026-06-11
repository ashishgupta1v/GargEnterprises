/**
 * MovementQueueScreen — Neumorphic Approval Queue
 *
 * Matches Stitch "Approval Queue" mockup:
 * - Counter pill with gradient
 * - Filter tabs (pending/approved/rejected)
 * - Approval cards with approve/reject gradient buttons
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';

const TABS = ['Pending', 'Approved', 'Rejected'];

interface Movement {
  id: number;
  type: string;
  product: string;
  sku: string;
  qty: number;
  submittedBy: string;
  time: string;
  status: string;
}

const SAMPLE: Movement[] = [
  { id: 1, type: 'GRN', product: 'Hindware Chimney 60cm', sku: 'HW-CH-60-AC', qty: 25, submittedBy: 'Rahul M.', time: '09:14 AM', status: 'pending' },
  { id: 2, type: 'OUT', product: 'Kaff Hob 4 Burner', sku: 'KF-HB-4B-BI', qty: 10, submittedBy: 'Amit S.', time: '08:45 AM', status: 'pending' },
  { id: 3, type: 'TFR', product: 'Franke Sink 32"', sku: 'FK-SK-SS-32', qty: 5, submittedBy: 'Vikram K.', time: '08:22 AM', status: 'pending' },
];

export default function MovementQueueScreen() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [movements, setMovements] = useState(SAMPLE);

  const filtered = movements.filter(m =>
    activeTab === 'Pending' ? m.status === 'pending' :
    activeTab === 'Approved' ? m.status === 'approved' :
    m.status === 'rejected'
  );

  const pendingCount = movements.filter(m => m.status === 'pending').length;

  const handleAction = (id: number, action: 'approved' | 'rejected') => {
    setMovements(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
    Alert.alert('Done', `Movement ${action} successfully.`);
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'GRN': return 'arrow-down-circle';
      case 'OUT': return 'arrow-up-circle';
      case 'TFR': return 'swap-horizontal';
      default: return 'document-text';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'GRN': return [colors.successStart, colors.successEnd];
      case 'OUT': return [colors.dangerStart, colors.dangerEnd];
      case 'TFR': return [colors.infoStart, colors.infoEnd];
      default: return [colors.primaryStart, colors.primaryEnd];
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={typography.titleLarge}>Approval Queue</Text>

        {/* Pending Counter Pill */}
        {pendingCount > 0 && (
          <LinearGradient
            colors={[colors.primaryStart, colors.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.counterPill, shadows.flat]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time" size={14} color={colors.white} />
              <Text style={styles.counterText}>{pendingCount} Pending</Text>
            </View>
          </LinearGradient>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabTrack, shadows.flat]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { paddingVertical: 0, overflow: 'hidden' }
            ]}
          >
            {activeTab === tab ? (
              <LinearGradient
                colors={[colors.primaryStart, colors.primaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabActiveGradient}
              >
                <Text style={styles.tabTextActive}>{tab}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>{tab}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Movement Cards */}
      <FlatList
        data={filtered}
        keyExtractor={m => m.id.toString()}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.hero }}
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.raise]}>
            {/* Type badge */}
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={getTypeGradient(item.type) as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.typeBadge}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={getTypeIcon(item.type)} size={14} color={colors.white} />
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
              </LinearGradient>
              <Text style={typography.caption}>{item.time}</Text>
            </View>

            {/* Product info */}
            <Text style={[typography.titleSmall, { color: colors.textPrimary, marginBottom: spacing.xs }]}>{item.product}</Text>
            <Text style={[typography.mono, { fontSize: 11, color: colors.textPlaceholder, marginBottom: spacing.md }]}>{item.sku}</Text>

            {/* Details */}
            <View style={styles.detailRow}>
              <Text style={typography.caption}>Quantity</Text>
              <Text style={[typography.mono, { fontWeight: '700' }]}>{item.qty}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={typography.caption}>Submitted by</Text>
              <Text style={typography.titleSmall}>{item.submittedBy}</Text>
            </View>

            {/* Action buttons (only for pending) */}
            {item.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.rejectBtn, shadows.dangerBtn]}
                  onPress={() => handleAction(item.id, 'rejected')}
                >
                  <LinearGradient
                    colors={[colors.dangerStart, colors.dangerEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionBtnGradient}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="close" size={16} color={colors.white} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.approveBtn, shadows.successBtn]}
                  onPress={() => handleAction(item.id, 'approved')}
                >
                  <LinearGradient
                    colors={[colors.successStart, colors.successEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionBtnGradient}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Status badge (for approved/rejected) */}
            {item.status !== 'pending' && (
              <LinearGradient
                colors={
                  item.status === 'approved'
                    ? [colors.successStart, colors.successEnd]
                    : [colors.dangerStart, colors.dangerEnd]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.statusBadge}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={item.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={colors.white}
                  />
                  <Text style={styles.statusText}>
                    {item.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, shadows.raise]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.successStart} />
            </View>
            <Text style={typography.title}>All Clear!</Text>
            <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.sm }]}>
              No {activeTab.toLowerCase()} movements
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  header: {
    paddingHorizontal: spacing.xl, paddingTop: spacing.hero, paddingBottom: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  counterPill: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: '700' },

  // Tabs
  tabTrack: {
    flexDirection: 'row', marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    backgroundColor: colors.baseDk, borderRadius: borderRadius.sm, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
    justifyContent: 'center',
  },
  tabActiveGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm - 2,
    paddingVertical: spacing.md,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  tabTextActive: { color: colors.white, fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: colors.base, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },

  // Actions
  actionRow: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl,
  },
  rejectBtn: {
    flex: 1, height: 44,
    borderRadius: borderRadius.sm, overflow: 'hidden',
  },
  rejectBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  approveBtn: {
    flex: 1, height: 44,
    borderRadius: borderRadius.sm, overflow: 'hidden',
  },
  approveBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  actionBtnGradient: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },

  statusBadge: {
    alignSelf: 'flex-start', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, marginTop: spacing.lg,
  },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: spacing.hero * 2 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
