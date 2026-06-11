/**
 * NmInput — Neumorphic Input Field
 *
 * Inset shadow (pressed-in) appearance with focus glow ring.
 * Includes optional label above in overline style.
 */
import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

interface NmInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const NmInput = forwardRef<TextInput, NmInputProps>(({ label, error, style, ...props }, ref) => {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textPlaceholder}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

NmInput.displayName = 'NmInput';
export default NmInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.overline,
    marginBottom: spacing.xs + 2,
    color: colors.textSubtle,
  },
  input: {
    height: 52,
    backgroundColor: colors.base,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
    // Simulated inset shadow via border
    borderWidth: 1,
    borderColor: colors.baseDk,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
