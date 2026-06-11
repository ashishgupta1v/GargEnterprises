import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, shadows, spacing, stockStatusConfig } from '../theme';

interface StockBadgeProps {
  statusFlag: keyof typeof stockStatusConfig;
  size?: 'sm' | 'md';
}

export default function StockBadge({ statusFlag, size = 'sm' }: StockBadgeProps) {
  const config = stockStatusConfig[statusFlag] || stockStatusConfig.in_stock;
  const isMd = size === 'md';

  return (
    <LinearGradient
      colors={[config.gradientStart, config.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        shadows.flat,
        isMd && styles.badgeMd,
      ]}
    >
      <View style={styles.dot} />
      <Text style={[styles.text, isMd && styles.textMd]}>
        {config.label}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 5,
  },
  badgeMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textMd: {
    fontSize: 12,
  },
});
