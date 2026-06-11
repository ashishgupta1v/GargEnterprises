/**
 * OwnerNavigator — Neumorphic Tab Bar
 * 
 * Light #EEF0F5 background, gradient active indicator.
 * Tabs: Dashboard | Catalogue | Approvals | Reports | Profile
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import OwnerDashboardScreen from '../screens/dashboard/OwnerDashboardScreen';
import ProductListScreen from '../screens/catalog/ProductListScreen';
import MovementQueueScreen from '../screens/inventory/MovementQueueScreen';
import InventoryReportsScreen from '../screens/reports/InventoryReportsScreen';
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

export default function OwnerNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Dashboard" component={OwnerDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tab.Screen name="Catalogue" component={ProductListScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="cube" focused={focused} /> }} />
      <Tab.Screen name="Approvals" component={MovementQueueScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="checkmark-circle" focused={focused} /> }} />
      <Tab.Screen name="Reports" component={InventoryReportsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" focused={focused} /> }} />
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
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: colors.primaryStart,
  },
});
