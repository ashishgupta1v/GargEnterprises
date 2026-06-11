/**
 * StockLevelScreen — Neumorphic Stock Board
 *
 * Matches Stitch "Stock Board" mockup:
 * - 3 summary pods (in-stock/low/out) with gradient accents
 * - Search bar
 * - Floating list rows with colored stock numbers + bars
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmSearchBar from '../../components/NmSearchBar';
import { api } from '../../services/api';

interface StockItem {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  stock_status_flag: string;
}

const SAMPLE: StockItem[] = [
  { id: 1, name: 'Hindware Chimney 60cm', sku: 'HW-CH-60-AC', current_stock: 45, min_stock: 10, max_stock: 100, stock_status_flag: 'in_stock' },
  { id: 2, name: 'Kaff Built-In Hob 4B', sku: 'KF-HB-4B-BI', current_stock: 8, min_stock: 15, max_stock: 50, stock_status_flag: 'low_stock' },
  { id: 3, name: 'Franke Steel Sink 32"', sku: 'FK-SK-SS-32', current_stock: 0, min_stock: 5, max_stock: 30, stock_status_flag: 'out_of_stock' },
  { id: 4, name: 'Hafele Soft-Close Hinge', sku: 'HF-HN-SC-01', current_stock: 120, min_stock: 20, max_stock: 200, stock_status_flag: 'in_stock' },
  { id: 5, name: 'Elica Chimney 90cm SS', sku: 'EL-CH-90-SS', current_stock: 3, min_stock: 10, max_stock: 40, stock_status_flag: 'low_stock' },
];

export default function StockLevelScreen() {
  const [items, setItems] = useState<StockItem[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = items.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
  });

  const summary = {
    inStock: items.filter(i => i.stock_status_flag === 'in_stock').length,
    low: items.filter(i => i.stock_status_flag === 'low_stock').length,
    out: items.filter(i => i.stock_status_flag === 'out_of_stock').length,
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStockColor = (flag: string) => {
    switch (flag) {
      case 'in_stock': return colors.successStart;
      case 'low_stock': return colors.warningStart;
      case 'out_of_stock': return colors.dangerStart;
      default: return colors.textSubtle;
    }
  };

  const getStockGradient = (flag: string) => {
    switch (flag) {
      case 'in_stock': return [colors.successStart, colors.successEnd];
      case 'low_stock': return [colors.warningStart, colors.warningEnd];
      case 'out_of_stock': return [colors.dangerStart, colors.dangerEnd];
      default: return [colors.textPlaceholder, colors.textPlaceholder];
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={typography.titleLarge}>Stock Board</Text>
      </View>

      {/* Summary Pods */}
      <View style={styles.podRow}>
        <View style={[styles.pod, shadows.raise]}>
          <LinearGradient
            colors={[colors.successStart, colors.successEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.podStrip}
          />
          <Text style={[styles.podValue, { color: colors.successStart }]}>{summary.inStock}</Text>
          <Text style={styles.podLabel}>IN STOCK</Text>
        </View>
        <View style={[styles.pod, shadows.raise]}>
          <LinearGradient
            colors={[colors.warningStart, colors.warningEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.podStrip}
          />
          <Text style={[styles.podValue, { color: colors.warningStart }]}>{summary.low}</Text>
          <Text style={styles.podLabel}>LOW</Text>
        </View>
        <View style={[styles.pod, shadows.raise]}>
          <LinearGradient
            colors={[colors.dangerStart, colors.dangerEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.podStrip}
          />
          <Text style={[styles.podValue, { color: colors.dangerStart }]}>{summary.out}</Text>
          <Text style={styles.podLabel}>OUT</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
        <NmSearchBar placeholder="Search stock..." value={search} onChangeText={setSearch} />
      </View>

      {/* Stock List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.hero }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const pct = Math.min((item.current_stock / item.max_stock) * 100, 100);
          return (
            <View style={[styles.stockRow, shadows.raiseSm]}>
              <View style={{ flex: 1 }}>
                <Text style={typography.titleSmall}>{item.name}</Text>
                <Text style={[typography.mono, { fontSize: 11, color: colors.textPlaceholder }]}>{item.sku}</Text>
              </View>
              <View style={styles.stockRight}>
                <Text style={[styles.stockNum, { color: getStockColor(item.stock_status_flag) }]}>
                  {item.current_stock}
                </Text>
                <View style={styles.miniTrack}>
                  <LinearGradient
                    colors={getStockGradient(item.stock_status_flag) as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.miniFill, { width: `${pct}%` }]}
                  />
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.hero, paddingBottom: spacing.lg },

  podRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.md, marginBottom: spacing.xxl },
  pod: {
    flex: 1, backgroundColor: colors.base, borderRadius: borderRadius.md,
    padding: spacing.lg, alignItems: 'center', overflow: 'hidden',
  },
  podStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  podValue: { fontSize: 24, fontWeight: '800', fontFamily: 'monospace', marginBottom: spacing.xs },
  podLabel: { ...typography.overline, fontSize: 9 },

  stockRow: {
    backgroundColor: colors.base, borderRadius: borderRadius.md,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center',
    gap: spacing.lg, marginBottom: spacing.md,
  },
  stockRight: { alignItems: 'flex-end', width: 60 },
  stockNum: { fontSize: 18, fontWeight: '800', fontFamily: 'monospace', marginBottom: spacing.xs },
  miniTrack: { width: 50, height: 4, backgroundColor: colors.baseDk, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: 4, borderRadius: 2 },
});
