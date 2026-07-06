import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CountrySelectionScreen from './src/screens/CountrySelectionScreen';
import ReviewPreferencesScreen from './src/screens/ReviewPreferencesScreen';
import DietaryPreferencesScreen from './src/screens/DietaryPreferencesScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanningScreen from './src/screens/ScanningScreen';
import RecipeResultsScreen from './src/screens/RecipeResultsScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';

import { SettingsProvider } from './src/context/SettingsContext';

import './src/lib/i18n'; // Initialize i18n

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CountrySelection" component={CountrySelectionScreen} />
          <Stack.Screen name="ReviewPreferences" component={ReviewPreferencesScreen} />
          <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scanning" component={ScanningScreen} />
          <Stack.Screen name="RecipeResults" component={RecipeResultsScreen} />
          <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
