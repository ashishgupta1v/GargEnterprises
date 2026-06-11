/**
 * OwnerDashboardScreen — Neumorphic Design
 *
 * Matches Stitch "Owner Dashboard" mockup:
 * - Greeting card with date
 * - 2×2 KPI grid with gradient accents
 * - Today's Movements list
 * - Stock Alerts section
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography, roleConfig } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';

const KPI_DATA = [
  { label: 'Total SKUs', value: '2,847', icon: 'cube', gradientColors: [colors.primaryStart, colors.primaryEnd], trend: '+12%' },
  { label: 'In Stock', value: '2,104', icon: 'checkmark-circle', gradientColors: [colors.successStart, colors.successEnd], trend: '74%' },
  { label: 'Low Stock', value: '189', icon: 'alert-circle', gradientColors: [colors.warningStart, colors.warningEnd], trend: '-8%' },
  { label: 'Out of Stock', value: '54', icon: 'close-circle', gradientColors: [colors.dangerStart, colors.dangerEnd], trend: '+3' },
];

const RECENT_MOVEMENTS = [
  { id: 1, type: 'GRN', product: 'Hindware Chimney 60cm', qty: '+25', time: '09:14 AM', status: 'approved' },
  { id: 2, type: 'OUT', product: 'Kaff Built-In Hob 4B', qty: '-10', time: '08:45 AM', status: 'pending' },
  { id: 3, type: 'TFR', product: 'Franke Sink Steel 32"', qty: '5', time: '08:22 AM', status: 'approved' },
];

const STOCK_ALERTS = [
  { id: 1, product: 'Elica Chimney 90cm SS', sku: 'EL-CH-90-SS', level: 3, severity: 'danger' },
  { id: 2, product: 'Hafele Hinge Soft-Close', sku: 'HF-HN-SC-01', level: 8, severity: 'warning' },
  { id: 3, product: 'Kaff Hood Island 60', sku: 'KF-HD-IS-60', level: 0, severity: 'danger' },
];

const getRoleIcon = (role?: string): keyof typeof Ionicons.glyphMap => {
  switch (role) {
    case 'owner': return 'ribbon';
    case 'manager': return 'briefcase';
    case 'staff': return 'pricetag';
    case 'godown': return 'cube';
    default: return 'person';
  }
};

export default function OwnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'GE';
  const roleConf = roleConfig[(user?.role || 'owner') as keyof typeof roleConfig];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={[roleConf.gradientStart, roleConf.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, shadows.raiseSm]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={typography.titleLarge}>Dashboard</Text>
        </View>
        <TouchableOpacity style={[styles.iconBtn, shadows.raiseSm]} onPress={() => navigation.navigate('SyncQueue')}>
          <Ionicons name="sync" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, shadows.raiseSm]}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Greeting Card ── */}
      <View style={[styles.greetingCard, shadows.raiseLg]}>
        <Text style={styles.greetingText}>{greeting()}, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
        <Text style={styles.greetingDate}>{today}</Text>
        <LinearGradient
          colors={[roleConf.gradientStart, roleConf.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.greetingBadge}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={getRoleIcon(user?.role)} size={14} color={colors.white} />
            <Text style={styles.greetingBadgeText}>{roleConf.label}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ── KPI Grid ── */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.kpiGrid}>
        {KPI_DATA.map((kpi, i) => (
          <View key={i} style={[styles.kpiCard, shadows.raise]}>
            <LinearGradient
              colors={kpi.gradientColors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.kpiStrip}
            />
            <LinearGradient
              colors={kpi.gradientColors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.kpiIcon, shadows.raiseSm]}
            >
              <Ionicons name={kpi.icon as any} size={20} color={colors.white} />
            </LinearGradient>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={[styles.kpiTrend, {
              color: kpi.trend.startsWith('+') || kpi.trend.includes('%')
                ? (kpi.icon === 'close-circle' ? colors.danger : colors.success)
                : colors.textSubtle,
            }]}>{kpi.trend}</Text>
          </View>
        ))}
      </View>

      {/* ── Today's Movements ── */}
      <Text style={styles.sectionTitle}>Today's Movements</Text>
      {RECENT_MOVEMENTS.map((m) => (
        <View key={m.id} style={[styles.movementRow, shadows.raiseSm]}>
          <LinearGradient
            colors={
              m.type === 'GRN' ? [colors.successStart, colors.successEnd] :
              m.type === 'OUT' ? [colors.dangerStart, colors.dangerEnd] : [colors.infoStart, colors.infoEnd]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.typeIcon}
          >
            <Ionicons
              name={m.type === 'GRN' ? 'arrow-down-circle' : m.type === 'OUT' ? 'arrow-up-circle' : 'swap-horizontal'}
              size={18}
              color={colors.white}
            />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={typography.titleSmall}>{m.product}</Text>
            <Text style={typography.caption}>{m.type} · {m.time}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.qtyText, {
              color: m.qty.startsWith('+') ? colors.success : m.qty.startsWith('-') ? colors.danger : colors.info,
            }]}>{m.qty}</Text>
            <LinearGradient
              colors={
                m.status === 'approved'
                  ? [colors.successStart, colors.successEnd]
                  : [colors.primaryStart, colors.primaryEnd]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusPill}
            >
              <Text style={styles.statusText}>{m.status}</Text>
            </LinearGradient>
          </View>
        </View>
      ))}

      {/* ── Stock Alerts ── */}
      <Text style={styles.sectionTitle}>Stock Alerts</Text>
      {STOCK_ALERTS.map((alert) => (
        <View key={alert.id} style={[styles.alertRow, shadows.raiseSm]}>
          <View style={[styles.severityDot, {
            backgroundColor: alert.severity === 'danger' ? colors.dangerStart : colors.warningStart,
          }]} />
          <View style={{ flex: 1 }}>
            <Text style={typography.titleSmall}>{alert.product}</Text>
            <Text style={[typography.mono, { fontSize: 11, color: colors.textPlaceholder }]}>{alert.sku}</Text>
          </View>
          <Text style={[styles.alertQty, {
            color: alert.severity === 'danger' ? colors.danger : colors.warning,
          }]}>{alert.level === 0 ? 'OUT' : alert.level}</Text>
        </View>
      ))}

      <View style={{ height: spacing.hero }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.hero,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Greeting Card
  greetingCard: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  greetingDate: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  greetingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  greetingBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Title
  sectionTitle: {
    ...typography.overline,
    color: colors.textSubtle,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  kpiCard: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '47%',
    overflow: 'hidden',
  },
  kpiStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kpiValue: {
    ...typography.kpiValue,
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    ...typography.kpiLabel,
  },
  kpiTrend: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  // Movement Rows
  movementRow: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Stock Alert Rows
  alertRow: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertQty: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
