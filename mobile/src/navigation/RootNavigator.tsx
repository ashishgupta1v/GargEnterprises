/**
 * RootNavigator — Neumorphic Splash + Role-Based Navigation
 *
 * Light neumorphic splash screen during hydration.
 * Routes to role-specific navigator after auth.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { colors, shadows, borderRadius, spacing } from '../theme';

import LoginRoleSelectionScreen from '../screens/auth/LoginRoleSelectionScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import OwnerNavigator from './OwnerNavigator';
import ManagerNavigator from './ManagerNavigator';
import StaffNavigator from './StaffNavigator';
import GodownNavigator from './GodownNavigator';
import SyncQueueScreen from '../screens/inventory/SyncQueueScreen';
import ProductDetailScreen from '../screens/catalog/ProductDetailScreen';
import RecordMovementScreen from '../screens/inventory/RecordMovementScreen';
import BarcodeScannerScreen from '../screens/inventory/BarcodeScannerScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginRoleSelection" component={LoginRoleSelectionScreen} />
      <AuthStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </AuthStack.Navigator>
  );
}

function getNavigatorForRole(role: string) {
  switch (role) {
    case 'owner': return OwnerNavigator;
    case 'manager': return ManagerNavigator;
    case 'staff': return StaffNavigator;
    case 'godown': return GodownNavigator;
    default: return StaffNavigator;
  }
}

/** Neumorphic splash — light background with raised logo */
function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <View style={[splashStyles.logoCircle, shadows.raiseLg]}>
        <Text style={splashStyles.logoText}>GE</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primaryStart} style={{ marginTop: spacing.xxl }} />
      <Text style={splashStyles.subtitle}>Loading...</Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSubtle,
    fontSize: 14,
    marginTop: spacing.md,
  },
});

export default function RootNavigator() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={getNavigatorForRole(user?.role || 'staff')}
            />
            <Stack.Screen name="SyncQueue" component={SyncQueueScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="RecordMovement" component={RecordMovementScreen} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

