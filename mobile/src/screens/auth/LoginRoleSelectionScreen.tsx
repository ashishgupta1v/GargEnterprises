import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import NmCard from '../../components/NmCard';
import NmButton from '../../components/NmButton';

type Role = 'Owner' | 'Manager' | 'Staff' | 'Godown';

const ROLES = [
  { id: 'Owner', icon: 'shield-checkmark', title: 'Owner' },
  { id: 'Manager', icon: 'people', title: 'Manager' },
  { id: 'Staff', icon: 'build', title: 'Staff' },
  { id: 'Godown', icon: 'home', title: 'Godown' },
] as const;

export default function LoginRoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>('Owner');
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();
  const { sendOtp, isLoading, error, clearError } = useAuthStore();

  async function handleSendOtp() {
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      clearError();
      await sendOtp(phone.trim(), selectedRole);
      navigation.navigate('OTPVerification', { phone: phone.trim(), role: selectedRole });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <NmCard style={styles.logoCard} variant="md">
            <Ionicons name="cube" size={40} color={colors.primaryStart} />
          </NmCard>
          <Text style={styles.brandName}>GargEnterprises</Text>
          <Text style={styles.brandSub}>Smart Inventory. Simplified.</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionLabel}>SELECT YOUR ROLE</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={styles.roleButtonContainer}
                  onPress={() => setSelectedRole(r.id)}
                  activeOpacity={0.8}
                >
                  <NmCard
                    variant="md"
                    inset={isSelected}
                    style={StyleSheet.flatten([styles.roleCard, isSelected && styles.roleCardActive])}
                  >
                    <Ionicons
                      name={r.icon as any}
                      size={28}
                      color={isSelected ? colors.primaryStart : colors.textSubtle}
                      style={{ marginBottom: spacing.sm }}
                    />
                    <Text style={[styles.roleTitle, isSelected && styles.roleTitleActive]}>
                      {r.title}
                    </Text>
                  </NmCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Input Form */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <NmCard variant="sm" inset style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Ionicons name="call" size={20} color={colors.textPlaceholder} style={styles.inputIcon} />
              <Text style={styles.inputPrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="00000 00000"
                placeholderTextColor={colors.textPlaceholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </NmCard>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Action Button */}
          <NmButton
            title={isLoading ? 'Sending...' : 'Send OTP'}
            onPress={handleSendOtp}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>

        <Text style={styles.footerHelp}>
          Need help? <Text style={styles.footerHelpLink}>Contact Support</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.hero, paddingBottom: spacing.xxxl },
  
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCard: { width: 80, height: 80, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  brandName: { ...typography.titleLarge, color: colors.primaryStart, marginBottom: spacing.xs },
  brandSub: { ...typography.caption, color: colors.textSubtle },

  roleSection: { marginBottom: spacing.xxl },
  sectionLabel: { ...typography.overline, color: colors.textSubtle, textAlign: 'center', marginBottom: spacing.lg },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  roleButtonContainer: { width: '47%' },
  roleCard: { alignItems: 'center', borderRadius: borderRadius.lg },
  roleCardActive: { backgroundColor: colors.baseDk },
  roleTitle: { ...typography.titleSmall, color: colors.textSubtle },
  roleTitleActive: { color: colors.primaryStart },

  inputSection: { marginBottom: spacing.xxxl },
  inputLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.sm, marginLeft: spacing.xs },
  inputCard: {
    height: 56,
    padding: 0,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: '100%',
  },
  inputIcon: { marginRight: spacing.sm },
  inputPrefix: { fontSize: 16, fontWeight: '600', color: colors.textMuted, marginRight: spacing.sm, paddingRight: spacing.sm, borderRightWidth: 1, borderRightColor: colors.divider },
  phoneInput: { flex: 1, fontSize: 16, color: colors.textPrimary, letterSpacing: 1, fontWeight: '500' },
  
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(229, 62, 62, 0.08)', padding: spacing.md, borderRadius: borderRadius.sm, marginBottom: spacing.lg },
  errorText: { fontSize: 13, fontWeight: '500', color: colors.danger },

  footerHelp: { textAlign: 'center', ...typography.caption, color: colors.textMuted },
  footerHelpLink: { color: colors.primaryStart, fontWeight: '600' },
});
