import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmCard from '../../components/NmCard';

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryStart} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>GargEnterprises</Text>
        </View>
        <TouchableOpacity style={{ padding: spacing.xs }}>
          <Ionicons name="person-circle" size={28} color={colors.primaryStart} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card */}
        <NmCard variant="lg" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.badges}>
              <View style={styles.badgeGold}>
                <Text style={styles.badgeGoldText}>HAFELE</Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>KITCHEN HARDWARE</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroContentRow}>
            <NmCard variant="md" inset style={styles.imageCard}>
              <Ionicons name="image" size={48} color={colors.primaryStart} />
            </NmCard>
            <View style={styles.heroTextContent}>
              <Text style={styles.productTitle}>Premium Linear Handle</Text>
              <Text style={styles.productSku}>SKU: HF-942-LX-G</Text>
              <Text style={styles.productDesc}>Architectural grade zinc alloy handle with a brushed brass finish. Designed for heavy-duty kitchen cabinetry and commercial interior applications.</Text>
            </View>
          </View>
        </NmCard>

        {/* Stats Pods */}
        <View style={styles.statsGrid}>
          {/* Price Pod */}
          <NmCard variant="sm" style={styles.statPod}>
            <Text style={styles.statLabel}>UNIT PRICE</Text>
            <Text style={styles.statValuePrimary}>₹ 1,245.00</Text>
            <Text style={styles.statSubGreen}>+18% GST</Text>
          </NmCard>

          {/* Unit Pod */}
          <NmCard variant="sm" style={styles.statPod}>
            <Text style={styles.statLabel}>PACKAGING UNIT</Text>
            <Text style={styles.statValue}>Box of 12 Pcs</Text>
            <Text style={styles.statSub}>Inner Pack: 1 Pc</Text>
          </NmCard>

          {/* Location Pod */}
          <NmCard variant="sm" style={styles.statPod}>
            <Text style={styles.statLabel}>WAREHOUSE ZONE</Text>
            <Text style={styles.statValue}>Zone A / Rack 42</Text>
            <View style={styles.statIconRow}>
              <Ionicons name="location" size={14} color={colors.primaryStart} />
              <Text style={styles.statSubPrimary}>MAIN HUB</Text>
            </View>
          </NmCard>
        </View>

        {/* Stock Status */}
        <NmCard variant="md" style={styles.stockCard}>
          <View style={styles.stockHeader}>
            <View>
              <Text style={styles.stockTitle}>Current Stock Level</Text>
              <Text style={styles.stockSubtitle}>Last updated: 12 mins ago</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.stockAmount}>482</Text>
              <Text style={styles.stockUnit}>Units</Text>
            </View>
          </View>
          
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#38A169', '#68D391']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: '72%' }]}
            />
          </View>

          <View style={styles.stockFooter}>
            <Text style={styles.stockReorder}>REORDER POINT: 150</Text>
            <Text style={styles.stockCapacity}>CAPACITY: 650</Text>
          </View>
        </NmCard>

        {/* Specs Section */}
        <NmCard variant="md" inset style={styles.specsCard}>
          <View style={styles.specsHeader}>
            <Ionicons name="settings" size={20} color={colors.primaryStart} style={{ marginRight: spacing.sm }} />
            <Text style={styles.specsTitle}>Technical Specifications</Text>
          </View>

          <View style={styles.specsGrid}>
            <SpecRow label="Material" value="Zinc Alloy" />
            <SpecRow label="Finish" value="Brushed Brass" />
            <SpecRow label="Length (CC)" value="160 mm" />
            <SpecRow label="Overall Length" value="184 mm" />
            <SpecRow label="Weight / Unit" value="245 grams" />
            <SpecRow label="Manufacturer" value="Hafele Germany" />
          </View>
        </NmCard>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <NmCard variant="sm" style={styles.editBtnCard}>
            <Ionicons name="pencil" size={20} color={colors.textPrimary} />
            <Text style={styles.editBtnText}>Edit Details</Text>
          </NmCard>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.recordBtn, shadows.primaryBtn]} activeOpacity={0.8} onPress={() => navigation.navigate('RecordMovement')}>
          <LinearGradient
            colors={[colors.primaryStart, colors.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recordBtnGradient}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.white} />
            <Text style={styles.recordBtnText}>Record Movement</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const SpecRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.base, zIndex: 10, ...shadows.raise },
  topBarTitle: { ...typography.titleLarge, color: colors.primaryStart },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 120 },
  
  heroCard: { borderRadius: borderRadius.xl, marginBottom: spacing.xl },
  heroHeader: { marginBottom: spacing.md },
  badges: { flexDirection: 'row', gap: spacing.sm },
  badgeGold: { backgroundColor: '#F6D365', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  badgeGoldText: { ...typography.overline, color: colors.white },
  badgeSecondary: { backgroundColor: colors.baseDk, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 12 },
  badgeSecondaryText: { ...typography.overline, color: colors.primaryStart },

  heroContentRow: { flexDirection: 'row', gap: spacing.xl },
  imageCard: { width: 100, height: 100, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  heroTextContent: { flex: 1 },
  productTitle: { ...typography.display, fontSize: 28, color: colors.textPrimary, marginBottom: spacing.xs },
  productSku: { fontFamily: 'JetBrains Mono', color: colors.primaryStart, fontSize: 13, marginBottom: spacing.sm },
  productDesc: { ...typography.body, fontSize: 14, color: colors.textSecondary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statPod: { flex: 1, minWidth: '30%', borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  statLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.xs, textAlign: 'center' },
  statValuePrimary: { fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: '700', color: colors.primaryStart, textAlign: 'center' },
  statValue: { ...typography.titleSmall, color: colors.textPrimary, textAlign: 'center' },
  statSubGreen: { ...typography.overline, color: colors.success, marginTop: spacing.xs, textAlign: 'center' },
  statSub: { ...typography.overline, color: colors.textSubtle, marginTop: spacing.xs, textAlign: 'center' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  statSubPrimary: { ...typography.overline, color: colors.primaryStart },

  stockCard: { borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.lg },
  stockTitle: { ...typography.titleSmall, color: colors.textPrimary },
  stockSubtitle: { ...typography.caption, fontSize: 12, color: colors.textMuted },
  stockAmount: { fontFamily: 'JetBrains Mono', fontSize: 32, fontWeight: '800', color: colors.primaryStart, lineHeight: 36 },
  stockUnit: { ...typography.titleSmall, color: colors.textMuted },
  progressBarBg: { height: 16, borderRadius: 8, backgroundColor: colors.baseDk, padding: 2, marginBottom: spacing.md },
  progressBarFill: { height: '100%', borderRadius: 6 },
  stockFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  stockReorder: { ...typography.overline, color: colors.danger },
  stockCapacity: { ...typography.overline, color: colors.textSubtle },

  specsCard: { borderRadius: borderRadius.xl, marginBottom: spacing.xl },
  specsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  specsTitle: { ...typography.titleSmall, color: colors.textPrimary },
  specsGrid: { gap: spacing.sm },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: spacing.xs },
  specLabel: { ...typography.body, fontSize: 14, color: colors.textMuted },
  specValue: { ...typography.titleSmall, fontSize: 14, color: colors.textSecondary },

  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.base, borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadows.raise },
  editBtn: { flex: 1 },
  editBtnCard: { height: 56, borderRadius: borderRadius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  editBtnText: { ...typography.titleSmall, color: colors.textPrimary },
  recordBtn: { flex: 2, height: 56, borderRadius: borderRadius.sm, overflow: 'hidden' },
  recordBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  recordBtnText: { ...typography.titleSmall, color: colors.white },
});
