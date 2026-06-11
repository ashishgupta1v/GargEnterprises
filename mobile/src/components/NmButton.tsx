import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../theme';
import { Shadow } from 'react-native-shadow-2';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'successGradient' | 'dangerGradient';

interface NmButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function NmButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}: NmButtonProps) {
  const isDisabled = disabled || loading;

  const isGradient = variant === 'primary' || variant === 'successGradient' || variant === 'dangerGradient';

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.primaryStart, colors.primaryEnd];
      case 'successGradient':
        return [colors.successStart, colors.successEnd];
      case 'dangerGradient':
        return [colors.dangerStart, colors.dangerEnd];
      default:
        return [colors.base, colors.base];
    }
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
      case 'successGradient':
      case 'dangerGradient':
      case 'secondary':
      case 'danger':
      case 'ghost':
      default:
        return [styles.container];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'successGradient':
      case 'dangerGradient':
        return colors.white;
      case 'danger':
        return colors.danger;
      case 'ghost':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const buttonContent = (
    <View style={styles.content}>
      {icon && <Text style={[styles.icon, { color: getTextColor() }]}>{icon}</Text>}
      <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
    </View>
  );

  const buttonElement = (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        ...getContainerStyle(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        (variant === 'secondary' || variant === 'danger') && styles.secondaryBg,
        variant === 'ghost' && styles.ghostBg,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : isGradient ? (
        <LinearGradient
          colors={getGradientColors() as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {buttonContent}
        </LinearGradient>
      ) : (
        <View style={styles.nonGradientContent}>
          {buttonContent}
        </View>
      )}
    </TouchableOpacity>
  );

  if (variant === 'ghost') {
    return buttonElement;
  }

  if (variant === 'secondary' || variant === 'danger') {
    return (
      <Shadow
        distance={6}
        startColor="#FFFFFF"
        endColor="rgba(255, 255, 255, 0)"
        offset={[-3, -3]}
        paintInside={false}
        containerStyle={[fullWidth ? styles.fullWidth : undefined]}
        style={{ borderRadius: borderRadius.sm, alignSelf: fullWidth ? 'stretch' : undefined }}
      >
        <Shadow
          distance={6}
          startColor={colors.shadowDark}
          endColor="rgba(209, 212, 222, 0)"
          offset={[3, 3]}
          paintInside={false}
          style={{ borderRadius: borderRadius.sm, alignSelf: fullWidth ? 'stretch' : undefined }}
        >
          {buttonElement}
        </Shadow>
      </Shadow>
    );
  }

  // Gradient buttons get a single colored shadow
  let shadowColor = colors.primary;
  if (variant === 'successGradient') shadowColor = colors.success;
  if (variant === 'dangerGradient') shadowColor = colors.danger;

  return (
    <Shadow
      distance={8}
      startColor={shadowColor + '59'} // 35% opacity approx
      endColor="rgba(255, 255, 255, 0)"
      offset={[4, 4]}
      paintInside={false}
      containerStyle={[fullWidth ? styles.fullWidth : undefined]}
      style={{ borderRadius: borderRadius.sm, alignSelf: fullWidth ? 'stretch' : undefined }}
    >
      {buttonElement}
    </Shadow>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryBg: {
    backgroundColor: colors.base,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  nonGradientContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  icon: {
    fontSize: 18,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
