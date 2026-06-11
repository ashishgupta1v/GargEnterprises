/**
 * GodownNavigator — Neumorphic Tab Bar
 * Tabs: Scan | Stock | Movement | Profile
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import BarcodeScannerScreen from '../screens/catalog/BarcodeScannerScreen';
import StockLevelScreen from '../screens/inventory/StockLevelScreen';
import RecordMovementScreen from '../screens/inventory/RecordMovementScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={focused ? name : `${name as string}-outline` as any}
        size={22}
        color={focused ? colors.primaryStart : colors.textPlaceholder}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function GodownNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Scan" component={BarcodeScannerScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="camera" focused={focused} /> }} />
      <Tab.Screen name="Stock" component={StockLevelScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="clipboard" focused={focused} /> }} />
      <Tab.Screen name="Movement" component={RecordMovementScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="add-circle" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

const screenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.base,
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    ...shadows.tabBar,
  },
  tabBarActiveTintColor: colors.primaryStart,
  tabBarInactiveTintColor: colors.textPlaceholder,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
};

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', gap: 4 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primaryStart },
});
