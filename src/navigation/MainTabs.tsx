import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Home, Refrigerator, MessageCircle, ShoppingBasket } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import { colors } from '../theme/colors';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: 'rgba(251,246,241,0.94)',
          borderTopColor: 'rgba(137,113,117,0.18)',
          height: 68,
          paddingBottom: 10,
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
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          title: t('pantry'),
          tabBarIcon: ({ color, size }) => <Refrigerator color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AIChef"
        component={AIAssistantScreen}
        options={{
          title: t('aiChef'),
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Grocery"
        component={ShoppingScreen}
        options={{
          title: t('grocery'),
          tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
