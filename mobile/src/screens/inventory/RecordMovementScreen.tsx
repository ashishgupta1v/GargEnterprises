import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmCard from '../../components/NmCard';

type MovementType = 'INWARD' | 'OUTWARD' | 'TRANSFER';

export default function RecordMovementScreen() {
  const navigation = useNavigation<any>();
  const [movementType, setMovementType] = useState<MovementType>('INWARD');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    // API mock or alert
    alert(`Movement Recorded: ${movementType} - ${quantity} units of ${sku || 'selected item'}`);
    navigation.goBack();
  };

  const handleScan = () => {
    navigation.navigate('BarcodeScanner');
  };

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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Text */}
          <View style={styles.header}>
            <Text style={styles.title}>Record Inventory Movement</Text>
            <Text style={styles.subtitle}>Log stock transfers, receipts, or dispatches.</Text>
          </View>

          {/* Segmented Control */}
          <NmCard variant="sm" inset style={styles.segmentedControl}>
            <View style={styles.segmentContainer}>
              {(['INWARD', 'OUTWARD', 'TRANSFER'] as MovementType[]).map((type) => {
                const isActive = movementType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.segmentButtonWrapper}
                    onPress={() => setMovementType(type)}
                    activeOpacity={0.8}
                  >
                    {isActive ? (
                      <NmCard variant="sm" style={styles.segmentButtonActive}>
                        <Text style={styles.segmentTextActive}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </Text>
                      </NmCard>
                    ) : (
                      <View style={styles.segmentButtonInactive}>
                        <Text style={styles.segmentTextInactive}>
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </NmCard>

          {/* Form Card */}
          <NmCard variant="lg" style={styles.formCard}>
            
            {/* Product Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>PRODUCT INFORMATION</Text>
              <View style={styles.productRow}>
                <NmCard variant="md" inset style={styles.inputCard}>
                  <Ionicons name="cube" size={20} color={colors.textPlaceholder} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Search SKU or Product Name"
                    placeholderTextColor={colors.textPlaceholder}
                    value={sku}
                    onChangeText={setSku}
                  />
                </NmCard>
                <TouchableOpacity onPress={handleScan} activeOpacity={0.8}>
                  <NmCard variant="sm" style={styles.cameraBtn}>
                    <Ionicons name="camera" size={24} color={colors.primaryStart} />
                  </NmCard>
                </TouchableOpacity>
              </View>
              {sku.length > 0 && (
                <View style={styles.mockProductInfo}>
                  <View style={styles.mockDot} />
                  <Text style={styles.mockProductText}>HAF-912.04.451 (Soft-Close Hinge)</Text>
                </View>
              )}
            </View>

            {/* Quantity Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>QUANTITY & UNIT</Text>
              <View style={styles.quantityRow}>
                <NmCard variant="md" inset style={StyleSheet.flatten([styles.inputCard, { flex: 1 }])}>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </NmCard>
                <NmCard variant="md" style={styles.unitSelector}>
                  <Text style={styles.unitText}>Cartons</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                </NmCard>
              </View>
            </View>

            {/* Notes Field */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>TRANSACTION NOTES</Text>
              <NmCard variant="md" inset style={styles.notesCard}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add warehouse location, reference number, or damage reports..."
                  placeholderTextColor={colors.textPlaceholder}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
              </NmCard>
            </View>

            {/* Warehouse Visual Info */}
            <View style={styles.warehouseInfo}>
              <View style={styles.infoPill}>
                <Ionicons name="location" size={16} color={colors.textSubtle} />
                <Text style={styles.infoText}>Current: Main Bay A4</Text>
              </View>
              <View style={styles.infoPill}>
                <Ionicons name="time" size={16} color={colors.textSubtle} />
                <Text style={styles.infoText}>Last Log: 2h ago</Text>
              </View>
            </View>

          </NmCard>

          {/* Informational Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={colors.primaryStart} />
            <Text style={styles.infoBannerText}>
              Confirming this movement will update the master stock ledger and reflect in real-time on the main dashboard for all users.
            </Text>
          </View>

          <View style={{ height: 100 }} /> {/* Padding for bottom button */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Confirm Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={[styles.confirmBtn, shadows.primaryBtn]} onPress={handleConfirm}>
          <LinearGradient
            colors={[colors.primaryStart, colors.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmBtnGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            <Text style={styles.confirmBtnText}>Confirm Movement</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.base, zIndex: 10 },
  topBarTitle: { ...typography.titleLarge, color: colors.primaryStart },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  
  header: { marginBottom: spacing.xl },
  title: { ...typography.title, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.caption, color: colors.textMuted },

  segmentedControl: { borderRadius: borderRadius.xl, marginBottom: spacing.xl },
  segmentContainer: { flexDirection: 'row', width: '100%' },
  segmentButtonWrapper: { flex: 1 },
  segmentButtonActive: { height: 40, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  segmentButtonInactive: { height: 40, alignItems: 'center', justifyContent: 'center' },
  segmentTextActive: { ...typography.titleSmall, color: colors.primaryStart },
  segmentTextInactive: { ...typography.titleSmall, color: colors.textSubtle },

  formCard: { borderRadius: 24, marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  formGroup: { marginBottom: spacing.xl },
  formLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.sm },
  
  productRow: { flexDirection: 'row', gap: spacing.md },
  inputCard: { flex: 1, height: 56, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, color: colors.textSecondary, fontSize: 16 },
  cameraBtn: { width: 56, height: 56, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },

  mockProductInfo: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.sm },
  mockDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: spacing.sm },
  mockProductText: { ...typography.caption, color: colors.primary, fontFamily: 'JetBrains Mono' },

  quantityRow: { flexDirection: 'row', gap: spacing.md },
  quantityInput: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  unitSelector: { flex: 1, height: 56, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  unitText: { ...typography.body, color: colors.textSecondary },

  notesCard: { borderRadius: borderRadius.md, minHeight: 100 },
  notesInput: { flex: 1, color: colors.textSecondary, fontSize: 16 },

  warehouseInfo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.baseDk, paddingTop: spacing.lg },
  infoPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { ...typography.caption, color: colors.textSubtle, fontSize: 13 },

  infoBanner: { flexDirection: 'row', backgroundColor: colors.baseDk, padding: spacing.lg, borderRadius: borderRadius.lg, gap: spacing.md },
  infoBannerText: { flex: 1, ...typography.caption, color: colors.textMuted, fontSize: 13 },

  stickyFooter: { position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: spacing.xl },
  confirmBtn: { height: 64, borderRadius: 24, overflow: 'hidden' },
  confirmBtnGradient: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  confirmBtnText: { ...typography.title, color: colors.white },
});
