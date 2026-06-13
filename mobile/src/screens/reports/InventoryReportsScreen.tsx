/**
 * InventoryReportsScreen — Premium Neumorphic SVG Reports & Analytics
 *
 * Replaces the mock placeholder screen with custom, type-safe SVG components
 * compatible with React 19 and React Native 0.81.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Text as SvgText,
  G,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';

const TABS = ['Overview', 'Movement', 'Valuation'];

interface ChartData {
  totalSkus: string;
  totalValue: string;
  movementsCount: string;
  pendingApprovals: string;
  stockDistribution: { category: string; value: number; max: number; gradient: string }[];
  movementTrend: { type: string; count: number; color: string }[];
}

const FILTER_DATA: Record<string, ChartData> = {
  Overview: {
    totalSkus: '2,847',
    totalValue: '₹2.84 Cr',
    movementsCount: '24',
    pendingApprovals: '3',
    stockDistribution: [
      { category: 'Chimneys', value: 80, max: 100, gradient: 'grad-primary' },
      { category: 'Hobs', value: 45, max: 100, gradient: 'grad-teal' },
      { category: 'Sinks', value: 20, max: 100, gradient: 'grad-danger' },
      { category: 'Hardware', value: 95, max: 100, gradient: 'grad-success' },
      { category: 'Acc.', value: 60, max: 100, gradient: 'grad-purple' },
    ],
    movementTrend: [
      { type: 'Inwards', count: 72, color: colors.success },
      { type: 'Outwards', count: 48, color: colors.primary },
      { type: 'Transfers', count: 24, color: colors.tealStart },
      { type: 'Write-offs', count: 12, color: colors.danger },
    ],
  },
  Movement: {
    totalSkus: '2,847',
    totalValue: '₹2.84 Cr',
    movementsCount: '156',
    pendingApprovals: '3',
    stockDistribution: [
      { category: 'Chimneys', value: 95, max: 100, gradient: 'grad-primary' },
      { category: 'Hobs', value: 60, max: 100, gradient: 'grad-teal' },
      { category: 'Sinks', value: 35, max: 100, gradient: 'grad-danger' },
      { category: 'Hardware', value: 85, max: 100, gradient: 'grad-success' },
      { category: 'Acc.', value: 70, max: 100, gradient: 'grad-purple' },
    ],
    movementTrend: [
      { type: 'Inwards', count: 95, color: colors.success },
      { type: 'Outwards', count: 35, color: colors.primary },
      { type: 'Transfers', count: 18, color: colors.tealStart },
      { type: 'Write-offs', count: 8, color: colors.danger },
    ],
  },
  Valuation: {
    totalSkus: '2,847',
    totalValue: '₹2.85 Cr',
    movementsCount: '620',
    pendingApprovals: '1',
    stockDistribution: [
      { category: 'Chimneys', value: 70, max: 100, gradient: 'grad-primary' },
      { category: 'Hobs', value: 80, max: 100, gradient: 'grad-teal' },
      { category: 'Sinks', value: 50, max: 100, gradient: 'grad-danger' },
      { category: 'Hardware', value: 75, max: 100, gradient: 'grad-success' },
      { category: 'Acc.', value: 85, max: 100, gradient: 'grad-purple' },
    ],
    movementTrend: [
      { type: 'Inwards', count: 310, color: colors.success },
      { type: 'Outwards', count: 195, color: colors.primary },
      { type: 'Transfers', count: 85, color: colors.tealStart },
      { type: 'Write-offs', count: 30, color: colors.danger },
    ],
  },
};

export default function InventoryReportsScreen() {
  const [activeTab, setActiveTab] = useState('Overview');
  const data = FILTER_DATA[activeTab] || FILTER_DATA.Overview;

  const SUMMARY_CARDS = [
    { label: 'Total SKUs', value: data.totalSkus, icon: '📦', color: colors.primaryStart },
    { label: 'Total Value', value: data.totalValue, icon: '💰', color: colors.successStart },
    { label: 'Movements Today', value: data.movementsCount, icon: '📊', color: colors.infoStart },
    { label: 'Pending Approvals', value: data.pendingApprovals, icon: '⏳', color: colors.warningStart },
  ];

  // Donut chart calculations
  const totalMovements = data.movementTrend.reduce((sum, item) => sum + item.count, 0);
  let accumulatedPercent = 0;
  const donutRadius = 46;
  const circumference = 2 * Math.PI * donutRadius; // 289.02

  const segments = data.movementTrend.map((item) => {
    const percent = totalMovements > 0 ? item.count / totalMovements : 0;
    const strokeLength = percent * circumference;
    const gapLength = circumference - strokeLength;
    const offset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      strokeDasharray: `${strokeLength} ${gapLength}`,
      strokeDashoffset: offset,
    };
  });

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

      {/* Stock Distribution - SVG Bar Chart */}
      <Text style={styles.sectionLabel}>STOCK DISTRIBUTION</Text>
      <View style={[styles.chartCard, shadows.raise]}>
        <View style={styles.chartContainer}>
          <Svg width="100%" height={180} viewBox="0 0 320 180">
            <Defs>
              <SvgLinearGradient id="grad-primary" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.primaryStart} />
                <Stop offset="100%" stopColor={colors.primaryEnd} />
              </SvgLinearGradient>
              <SvgLinearGradient id="grad-teal" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.tealStart} />
                <Stop offset="100%" stopColor={colors.tealEnd} />
              </SvgLinearGradient>
              <SvgLinearGradient id="grad-success" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.successStart} />
                <Stop offset="100%" stopColor={colors.successEnd} />
              </SvgLinearGradient>
              <SvgLinearGradient id="grad-warning" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.warningStart} />
                <Stop offset="100%" stopColor={colors.warningEnd} />
              </SvgLinearGradient>
              <SvgLinearGradient id="grad-danger" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.dangerStart} />
                <Stop offset="100%" stopColor={colors.dangerEnd} />
              </SvgLinearGradient>
              <SvgLinearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={colors.purpleStart} />
                <Stop offset="100%" stopColor={colors.purpleEnd} />
              </SvgLinearGradient>
            </Defs>

            {/* Background Grid Lines */}
            <Line x1="30" y1="20" x2="300" y2="20" stroke={colors.baseDk} strokeWidth="1" strokeDasharray="3,3" />
            <Line x1="30" y1="50" x2="300" y2="50" stroke={colors.baseDk} strokeWidth="1" strokeDasharray="3,3" />
            <Line x1="30" y1="80" x2="300" y2="80" stroke={colors.baseDk} strokeWidth="1" strokeDasharray="3,3" />
            <Line x1="30" y1="110" x2="300" y2="110" stroke={colors.baseDk} strokeWidth="1" strokeDasharray="3,3" />
            <Line x1="30" y1="140" x2="300" y2="140" stroke={colors.baseDk} strokeWidth="1" strokeDasharray="3,3" />

            {/* Grid labels */}
            <SvgText x="20" y="23" fontSize="8" fontWeight="600" fill={colors.textPlaceholder} textAnchor="end">100</SvgText>
            <SvgText x="20" y="53" fontSize="8" fontWeight="600" fill={colors.textPlaceholder} textAnchor="end">75</SvgText>
            <SvgText x="20" y="83" fontSize="8" fontWeight="600" fill={colors.textPlaceholder} textAnchor="end">50</SvgText>
            <SvgText x="20" y="113" fontSize="8" fontWeight="600" fill={colors.textPlaceholder} textAnchor="end">25</SvgText>
            <SvgText x="20" y="143" fontSize="8" fontWeight="600" fill={colors.textPlaceholder} textAnchor="end">0</SvgText>

            {/* Bars */}
            {data.stockDistribution.map((item, i) => {
              const plotWidth = 270;
              const colSpacing = plotWidth / 5;
              const cx = 30 + colSpacing / 2 + i * colSpacing;
              const barWidth = 16;
              const trackHeight = 120;
              const barHeight = (item.value / item.max) * trackHeight;

              return (
                <G key={i}>
                  {/* Track light highlight (Neumorphic inset effect) */}
                  <Rect x={cx - barWidth / 2 - 1} y={19} width={barWidth + 2} height={trackHeight + 2} rx={9} fill="#FFFFFF" opacity={0.6} />
                  {/* Track shadow outline */}
                  <Rect x={cx - barWidth / 2} y={20} width={barWidth} height={trackHeight} rx={8} fill={colors.baseDk} />
                  
                  {/* Active Bar with color gradient */}
                  {barHeight > 0 && (
                    <Rect
                      x={cx - barWidth / 2}
                      y={140 - barHeight}
                      width={barWidth}
                      height={barHeight}
                      rx={8}
                      fill={`url(#${item.gradient})`}
                    />
                  )}

                  {/* Percentage label above the bar */}
                  <SvgText x={cx} y={132 - barHeight} fontSize="8" fontWeight="800" fill={colors.textSecondary} textAnchor="middle">
                    {item.value}%
                  </SvgText>

                  {/* Category Label at the bottom */}
                  <SvgText x={cx} y="158" fontSize="9" fontWeight="700" fill={colors.textSubtle} textAnchor="middle">
                    {item.category}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      </View>

      {/* Movement Trend - SVG Donut Chart */}
      <Text style={styles.sectionLabel}>MOVEMENT TREND</Text>
      <View style={[styles.chartCard, shadows.raise]}>
        <View style={styles.donutContainer}>
          <View style={styles.donutWrapper}>
            <Svg width={150} height={150} viewBox="0 0 160 160">
              <G transform="rotate(-90 80 80)">
                {/* Neumorphic shadow groove circles */}
                <Circle cx="78" cy="78" r={donutRadius} fill="none" stroke="#FFFFFF" strokeWidth="12" opacity="0.9" />
                <Circle cx="82" cy="82" r={donutRadius} fill="none" stroke={colors.shadowDark} strokeWidth="12" opacity="0.7" />
                <Circle cx="80" cy="80" r={donutRadius} fill="none" stroke={colors.base} strokeWidth="12" />

                {/* Donut chart data slices */}
                {segments.map((seg, i) => (
                  <Circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                  />
                ))}
              </G>

              {/* Central text indicators */}
              <SvgText x="80" y="78" textAnchor="middle" fontSize="18" fontWeight="800" fill={colors.textPrimary}>
                {totalMovements}
              </SvgText>
              <SvgText x="80" y="93" textAnchor="middle" fontSize="8" fontWeight="700" fill={colors.textSubtle} letterSpacing={0.5}>
                MOVEMENTS
              </SvgText>
            </Svg>
          </View>

          {/* Legend Stats */}
          <View style={styles.legendContainer}>
            {segments.map((seg, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={styles.legendLabel}>{seg.type}</Text>
                  <Text style={styles.legendValue}>
                    {seg.count} ({Math.round(seg.percent * 100)}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    flexDirection: 'row',
    backgroundColor: colors.baseDk,
    borderRadius: borderRadius.sm,
    padding: 4,
    marginBottom: spacing.xxl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabActive: { backgroundColor: colors.base },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSubtle },
  tabTextActive: { color: colors.textPrimary },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '47%',
    overflow: 'hidden',
  },
  cardStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardValue: { ...typography.kpiValue, fontSize: 20, marginBottom: spacing.xs },
  cardLabel: { ...typography.kpiLabel, fontSize: 10 },

  // Section
  sectionLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.md },

  // Charts
  chartCard: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  
  // Donut Layout
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  donutWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    paddingLeft: spacing.lg,
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  legendValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textSubtle,
    marginTop: 1,
  },
});
