/**
 * ProfileScreen — Neumorphic Profile & Settings
 *
 * Matches Stitch "Profile & Settings" mockup:
 * - Large gradient avatar card
 * - Stacked settings rows (nm-raise-sm, spaced independently)
 * - Logout with danger text
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography, roleConfig } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../services/api';

import LogoutModal from '../../components/LogoutModal';

const getRoleIcon = (role?: string): keyof typeof Ionicons.glyphMap => {
  switch (role) {
    case 'owner': return 'ribbon';
    case 'manager': return 'briefcase';
    case 'staff': return 'pricetag';
    case 'godown': return 'cube';
    default: return 'person';
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'GE';
  const roleConf = roleConfig[(user?.role || 'staff') as keyof typeof roleConfig];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        // Data refreshed
      }
    } catch { /* ignore */ }
    setRefreshing(false);
  };

  const handleLogoutPress = () => {
    setLogoutVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutVisible(false);
    await logout();
  };

  const handleCancelLogout = () => {
    setLogoutVisible(false);
  };

  const permissions = {
    owner: ['Full inventory access', 'Approve movements', 'Manage users', 'View reports', 'Export data'],
    manager: ['View catalog', 'Record movements', 'View stock levels', 'Scan barcodes'],
    staff: ['View catalog', 'Scan barcodes'],
    godown: ['Scan barcodes', 'View stock levels', 'Record movements'],
  };

  const userPerms = permissions[user?.role as keyof typeof permissions] || permissions.staff;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Avatar Card */}
      <View style={[styles.avatarCard, shadows.raiseLg]}>
        <LinearGradient
          colors={[roleConf.gradientStart, roleConf.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, shadows.raiseSm]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <LinearGradient
          colors={[roleConf.gradientStart, roleConf.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.roleBadge}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={getRoleIcon(user?.role)} size={14} color={colors.white} />
            <Text style={styles.roleBadgeText}>{roleConf.label}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Account Info */}
      <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>
      <View style={[styles.infoCard, shadows.raise]}>
        <InfoRow label="Phone" value={user?.phone || '+91 ****'} />
        <InfoRow label="Role" value={roleConf.label} />
        <InfoRow label="Status" value={user?.status || 'active'} isLast />
      </View>

      {/* Permissions */}
      <Text style={styles.sectionLabel}>YOUR PERMISSIONS</Text>
      <View style={[styles.infoCard, shadows.raise]}>
        {userPerms.map((perm, i) => (
          <View key={i} style={[styles.permRow, i < userPerms.length - 1 && styles.permRowBorder]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.successStart} />
            <Text style={styles.permText}>{perm}</Text>
          </View>
        ))}
      </View>

      {/* Settings Rows */}
      <Text style={styles.sectionLabel}>SETTINGS</Text>
      <SettingsRow icon="sync" label="Sync Queue Manager" trailing="chevron" onPress={() => navigation.navigate('SyncQueue')} />
      <SettingsRow icon="notifications" label="Notifications" trailing="chevron" />
      <SettingsRow icon="globe" label="Language" trailing="English" />
      <SettingsRow icon="phone-portrait" label="App Version" trailing="1.0.0" />
      <SettingsRow icon="analytics" label="Phase" trailing="Phase 1" />

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutRow, shadows.raiseSm]} onPress={handleLogoutPress} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: spacing.hero }} />

      <LogoutModal
        visible={logoutVisible}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </ScrollView>
  );
}

function InfoRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[infoStyles.row, !isLast && infoStyles.rowBorder]}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, trailing, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; trailing: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[settingsStyles.row, shadows.raiseSm]} activeOpacity={0.7} onPress={onPress}>
      <View style={settingsStyles.iconContainer}>
        <Ionicons name={icon} size={20} color={colors.primaryStart} />
      </View>
      <Text style={settingsStyles.label}>{label}</Text>
      {trailing === 'chevron' ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
      ) : (
        <Text style={settingsStyles.trailing}>{trailing}</Text>
      )}
    </TouchableOpacity>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.titleSmall },
});

const settingsStyles = StyleSheet.create({
  row: {
    backgroundColor: colors.base, borderRadius: borderRadius.md,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, marginBottom: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.titleSmall, flex: 1, color: colors.textPrimary },
  trailing: { ...typography.caption, color: colors.textPlaceholder, fontSize: 14 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.hero },

  // Avatar Card
  avatarCard: {
    backgroundColor: colors.base, borderRadius: borderRadius.xl,
    padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.xxl,
  },
  avatar: {
    width: 72, height: 72, borderRadius: borderRadius.full,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '800' },
  userName: { ...typography.display, fontSize: 20, marginBottom: spacing.sm },
  roleBadge: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },

  // Section
  sectionLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.md, marginTop: spacing.sm },

  // Info Card
  infoCard: {
    backgroundColor: colors.base, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.xxl,
  },

  // Permissions
  permRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  permRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  permText: { ...typography.body, color: colors.textSecondary },

  // Logout
  logoutRow: {
    backgroundColor: colors.base, borderRadius: borderRadius.md,
    padding: spacing.lg, alignItems: 'center', marginTop: spacing.md,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.danger },
});
