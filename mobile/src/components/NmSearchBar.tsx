/**
 * NmSearchBar — Neumorphic Search Pill
 *
 * Full-pill shape (borderRadius 999) with inset shadow.
 * Magnifying glass icon + placeholder text.
 */
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface NmSearchBarProps extends TextInputProps {
  icon?: string;
}

export default function NmSearchBar({ icon = '🔍', style, ...props }: NmSearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <TextInput
        placeholderTextColor={colors.textPlaceholder}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: colors.base,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.baseDk,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});
