/**
 * ProductFormScreen — Neumorphic Add/Edit Product
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';

export default function ProductFormScreen() {
  return (
    <View style={styles.screen}>
      <View style={[styles.card, shadows.raise]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryStart }, shadows.raiseSm]}>
          <Text style={{ fontSize: 28 }}>📝</Text>
        </View>
        <Text style={styles.title}>Add / Edit Product</Text>
        <Text style={styles.subtitle}>Full form implementation coming in Phase 1.1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.base, borderRadius: borderRadius.xl,
    padding: spacing.xxxl, alignItems: 'center',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  title: { ...typography.titleLarge, marginBottom: spacing.sm },
  subtitle: { ...typography.caption, textAlign: 'center' },
});
