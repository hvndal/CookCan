import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { MainTabs } from './MainTabs';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScanningScreen from '../screens/ScanningScreen';
import RecipeResultsScreen from '../screens/RecipeResultsScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import MealPlannerScreen from '../screens/MealPlannerScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading, onboardingDone } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Scanning" component={ScanningScreen} />
            <Stack.Screen name="RecipeResults" component={RecipeResultsScreen} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
            <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AdminGrant" component={AdminScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
