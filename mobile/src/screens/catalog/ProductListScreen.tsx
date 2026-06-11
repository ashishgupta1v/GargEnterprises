/**
 * ProductListScreen — Neumorphic Product Catalog
 *
 * Matches Stitch "Product Catalog" mockup:
 * - Search pill (nm-inset, full pill)
 * - Filter chips (scrollable, neumorphic flat)
 * - Product cards (nm-raise-sm, gradient brand pill, SKU mono, stock bar)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmSearchBar from '../../components/NmSearchBar';
import StockBadge from '../../components/StockBadge';
import { api } from '../../services/api';

const CATEGORIES = ['All', 'Chimneys', 'Hobs', 'Sinks', 'Hardware', 'Accessories'];

interface Product {
  id: number;
  name: string;
  sku: string;
  brand: string;
  category: string;
  unit_price: number;
  current_stock: number;
  stock_status_flag: string;
}

export default function ProductListScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.data?.data || res.data.data || []);
      }
    } catch (error) {
      // Use sample data if API is not available
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    setFilteredProducts(filtered);
  }, [search, activeCategory, products]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts().then(() => setRefreshing(false));
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, shadows.raiseSm]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      {/* Brand pill */}
      <View style={styles.cardTop}>
        <LinearGradient
          colors={[colors.primaryStart, colors.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.brandPill}
        >
          <Text style={styles.brandPillText}>{item.brand}</Text>
        </LinearGradient>
        <StockBadge statusFlag={item.stock_status_flag as any} />
      </View>

      {/* Product info */}
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productSku}>{item.sku}</Text>

      {/* Bottom row: price + stock */}
      <View style={styles.cardBottom}>
        <Text style={styles.productPrice}>₹{item.unit_price?.toLocaleString('en-IN')}</Text>
        <View style={styles.stockInfo}>
          <Text style={[styles.stockQty, {
            color: item.current_stock > 20 ? colors.success :
              item.current_stock > 0 ? colors.warning : colors.danger,
          }]}>{item.current_stock}</Text>
          <Text style={styles.stockUnit}>units</Text>
        </View>
      </View>

      {/* Stock bar */}
      <View style={styles.stockTrack}>
        <LinearGradient
          colors={
            item.current_stock > 20 ? [colors.successStart, colors.successEnd] :
            item.current_stock > 0 ? [colors.warningStart, colors.warningEnd] : [colors.dangerStart, colors.dangerEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.stockFill, {
            width: `${Math.min(item.current_stock / 100 * 100, 100)}%`,
          }]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.titleLarge}>Product Catalog</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          {filteredProducts.length} products
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <NmSearchBar
          placeholder="Search products, SKUs, brands..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ paddingHorizontal: spacing.xl }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.chip,
              shadows.flat,
              activeCategory === cat && { paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden' }
            ]}
          >
            {activeCategory === cat ? (
              <LinearGradient
                colors={[colors.primaryStart, colors.primaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chipActiveGradient}
              >
                <Text style={styles.chipTextActive}>{cat}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.chipText}>{cat}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, shadows.raise]}>
              <Ionicons name="cube" size={36} color={colors.primaryStart} />
            </View>
            <Text style={styles.emptyTitle}>
              {loading ? 'Loading products...' : 'No Products Found'}
            </Text>
            <Text style={styles.emptyBody}>
              {loading ? 'Fetching from server' : 'Try adjusting your search or filters'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: 'Hindware Chimney 60cm Auto Clean', sku: 'HW-CH-60-AC', brand: 'Hindware', category: 'Chimneys', unit_price: 18500, current_stock: 45, stock_status_flag: 'in_stock' },
  { id: 2, name: 'Kaff Built-In Hob 4 Burner', sku: 'KF-HB-4B-BI', brand: 'Kaff', category: 'Hobs', unit_price: 24900, current_stock: 8, stock_status_flag: 'low_stock' },
  { id: 3, name: 'Franke Stainless Steel Sink 32"', sku: 'FK-SK-SS-32', brand: 'Franke', category: 'Sinks', unit_price: 12400, current_stock: 0, stock_status_flag: 'out_of_stock' },
  { id: 4, name: 'Hafele Soft-Close Hinge Set', sku: 'HF-HN-SC-01', brand: 'Hafele', category: 'Hardware', unit_price: 850, current_stock: 120, stock_status_flag: 'in_stock' },
  { id: 5, name: 'Elica Chimney 90cm SS', sku: 'EL-CH-90-SS', brand: 'Elica', category: 'Chimneys', unit_price: 31200, current_stock: 3, stock_status_flag: 'low_stock' },
];

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.hero, paddingBottom: spacing.md },
  searchWrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },

  // Chips
  chipRow: { marginBottom: spacing.lg, maxHeight: 44 },
  chip: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  chipActiveGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: colors.white, fontSize: 12, fontWeight: '600' },

  // List
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.hero },

  // Product Card
  productCard: {
    backgroundColor: colors.base,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  brandPillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productSku: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textPlaceholder,
    marginBottom: spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  productPrice: {
    ...typography.mono,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stockInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  stockQty: { fontSize: 14, fontWeight: '800', fontFamily: 'monospace' },
  stockUnit: { ...typography.caption, fontSize: 10 },

  // Stock bar
  stockTrack: {
    height: 6,
    backgroundColor: colors.baseDk,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  stockFill: {
    height: 6,
    borderRadius: borderRadius.full,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: spacing.hero * 2 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: borderRadius.lg,
    backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: { ...typography.titleLarge, marginBottom: spacing.sm },
  emptyBody: { ...typography.caption, textAlign: 'center' },
});
