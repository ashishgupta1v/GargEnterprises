/**
 * InventoryReportsScreen — Neumorphic Reports Stub
 *
 * Matches Stitch "Inventory Reports" mockup:
 * - Tab bar (nm-inset style)
 * - Neumorphic chart placeholders
 * - Summary cards
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';

const TABS = ['Overview', 'Movement', 'Valuation'];

const SUMMARY_CARDS = [
  { label: 'Total SKUs', value: '2,847', icon: '📦', color: colors.primaryStart },
  { label: 'Total Value', value: '₹2.84 Cr', icon: '💰', color: colors.successStart },
  { label: 'Movements Today', value: '24', icon: '📊', color: colors.infoStart },
  { label: 'Pending Approvals', value: '3', icon: '⏳', color: colors.warningStart },
];

export default function InventoryReportsScreen() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[typography.titleLarge, { paddingTop: spacing.hero }]}>Inventory Reports</Text>
      <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.xxl }]}>
        Analytics & insights for your inventory
      </Text>

      {/* Tab Bar */}
      <View style={[styles.tabTrack, shadows.flat]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && [styles.tabActive, shadows.raiseSm]]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Grid */}
      <View style={styles.summaryGrid}>
        {SUMMARY_CARDS.map((card, i) => (
          <View key={i} style={[styles.summaryCard, shadows.raise]}>
            <View style={[styles.cardStrip, { backgroundColor: card.color }]} />
            <View style={[styles.cardIcon, { backgroundColor: card.color }, shadows.raiseSm]}>
              <Text style={{ fontSize: 18 }}>{card.icon}</Text>
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Chart Placeholders */}
      <Text style={styles.sectionLabel}>STOCK DISTRIBUTION</Text>
      <View style={[styles.chartCard, shadows.raise]}>
        <View style={styles.chartPlaceholder}>
          <View style={[styles.bar, { height: 80, backgroundColor: colors.successStart }]} />
          <View style={[styles.bar, { height: 40, backgroundColor: colors.warningStart }]} />
          <View style={[styles.bar, { height: 20, backgroundColor: colors.dangerStart }]} />
          <View style={[styles.bar, { height: 60, backgroundColor: colors.primaryStart }]} />
          <View style={[styles.bar, { height: 90, backgroundColor: colors.tealStart }]} />
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Chimneys</Text>
          <Text style={styles.chartLabel}>Hobs</Text>
          <Text style={styles.chartLabel}>Sinks</Text>
          <Text style={styles.chartLabel}>Hardware</Text>
          <Text style={styles.chartLabel}>Acc.</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>MOVEMENT TREND</Text>
      <View style={[styles.chartCard, shadows.raise]}>
        <View style={styles.trendPlaceholder}>
          <Text style={styles.trendText}>📈  Coming in Phase 2</Text>
          <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.sm }]}>
            Real-time movement charts with date filters
          </Text>
        </View>
      </View>

      <View style={{ height: spacing.hero * 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  content: { paddingHorizontal: spacing.xl },

  // Tabs
  tabTrack: {
    flexDirection: 'row', backgroundColor: colors.baseDk,
    borderRadius: borderRadius.sm, padding: 4, marginBottom: spacing.xxl,
  },
  tab: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabActive: { backgroundColor: colors.base },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  tabTextActive: { color: colors.textPrimary },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.base, borderRadius: borderRadius.lg,
    padding: spacing.xl, width: '47%', overflow: 'hidden',
  },
  cardStrip: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: borderRadius.sm,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  cardValue: { ...typography.kpiValue, fontSize: 20, marginBottom: spacing.xs },
  cardLabel: { ...typography.kpiLabel, fontSize: 10 },

  // Section
  sectionLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.md },

  // Charts
  chartCard: {
    backgroundColor: colors.base, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.xxl,
  },
  chartPlaceholder: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-around', height: 100, marginBottom: spacing.md,
  },
  bar: {
    width: 28, borderRadius: borderRadius.xs, opacity: 0.85,
  },
  chartLabels: {
    flexDirection: 'row', justifyContent: 'space-around',
  },
  chartLabel: { ...typography.caption, fontSize: 10 },

  trendPlaceholder: {
    alignItems: 'center', paddingVertical: spacing.xxxl,
  },
  trendText: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
});
