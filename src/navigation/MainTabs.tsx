import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Refrigerator, MessageCircle, ShoppingBasket } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import { colors } from '../theme/colors';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Refrigerator color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AIChef"
        component={AIAssistantScreen}
        options={{
          title: 'AI Chef',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Grocery"
        component={ShoppingScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
