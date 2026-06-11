import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { colors, borderRadius, spacing } from '../theme';

interface NmCardProps {
  children: React.ReactNode;
  variant?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  inset?: boolean;
}

export default function NmCard({ children, variant = 'md', style, inset = false }: NmCardProps) {
  const radius = variant === 'sm' ? borderRadius.sm : variant === 'lg' ? borderRadius.xl : borderRadius.md;
  const padding = variant === 'sm' ? spacing.lg : variant === 'lg' ? spacing.xxl : spacing.xl;
  const distance = variant === 'sm' ? 6 : variant === 'lg' ? 16 : 10;
  const offsetVal = variant === 'sm' ? 3 : variant === 'lg' ? 8 : 5;

  if (inset) {
    return (
      <View style={[
        styles.card,
        {
          borderRadius: radius,
          padding,
          borderWidth: 1.5,
          borderColor: colors.baseDk,
          backgroundColor: colors.baseLt,
        },
        style
      ]}>
        {children}
      </View>
    );
  }

  return (
    <Shadow
      distance={distance}
      startColor="#FFFFFF"
      endColor="rgba(255, 255, 255, 0)"
      offset={[-offsetVal, -offsetVal]}
      paintInside={false}
      containerStyle={[{ alignSelf: 'stretch' }, style]}
      style={{ borderRadius: radius, alignSelf: 'stretch' }}
    >
      <View style={{ borderRadius: radius, alignSelf: 'stretch' }}>
        <Shadow
          distance={distance}
          startColor={colors.shadowDark}
          endColor="rgba(209, 212, 222, 0)"
          offset={[offsetVal, offsetVal]}
          paintInside={false}
          style={{ borderRadius: radius, alignSelf: 'stretch' }}
        >
          <View style={[styles.card, { borderRadius: radius, padding }]}>
            {children}
          </View>
        </Shadow>
      </View>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.base,
    alignSelf: 'stretch',
  },
});
