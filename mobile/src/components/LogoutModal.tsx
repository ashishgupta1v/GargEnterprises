import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../theme';
import NmCard from './NmCard';
import NmButton from './NmButton';

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ visible, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Background decorative blur/glow (simulated) */}
        <View style={styles.decorativeGlow1} />
        <View style={styles.decorativeGlow2} />

        <View style={styles.content}>
          {/* Main Container */}
          <View style={styles.mainContainer}>
            
            {/* Large Neumorphic Icon Container */}
            <NmCard variant="lg" style={styles.iconOuter}>
              <NmCard variant="md" inset style={styles.iconInner}>
                <Ionicons name="log-out" size={56} color={colors.danger} />
              </NmCard>
            </NmCard>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Logout Account?</Text>
              <Text style={styles.subtitle}>
                Are you sure you want to sign out of <Text style={styles.boldPrimary}>GargEnterprises</Text>? You will need your PIN/OTP to log back in.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.primaryBtn, shadows.primaryBtn]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.danger, '#FC8181']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>Yes, Logout</Text>
                </LinearGradient>
              </TouchableOpacity>

              <NmButton
                title="Cancel"
                onPress={onCancel}
                variant="secondary"
                style={styles.secondaryBtn}
              />
            </View>

            {/* Subtle Brand Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDot} />
              <Text style={styles.footerText}>SECURE SESSION TERMINATION</Text>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(238, 240, 245, 0.9)', // Light overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: spacing.xl,
  },
  mainContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  // Icon
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.titleLarge,
    color: colors.primaryStart,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  boldPrimary: {
    fontWeight: '700',
    color: colors.primaryStart,
  },

  // Buttons
  buttonContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  primaryBtn: {
    height: 56,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    opacity: 0.5,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryStart,
  },
  footerText: {
    ...typography.overline,
    color: colors.textPlaceholder,
  },

  // Decorative
  decorativeGlow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryStart,
    opacity: 0.05,
  },
  decorativeGlow2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.textSubtle,
    opacity: 0.05,
  },
});
