import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BillingProvider, useBilling } from './src/context/BillingContext';
import { DataProvider, useData } from './src/context/DataContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './src/lib/i18n';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function SplashGate({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth();
  const { ready: billingReady } = useBilling();
  const { ready: dataReady } = useData();
  const { ready: settingsReady } = useSettings();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!authLoading && billingReady && dataReady && settingsReady && !hidden) {
      SplashScreen.hideAsync().finally(() => setHidden(true));
    }
  }, [authLoading, billingReady, dataReady, settingsReady, hidden]);

  return <>{children}</>;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <SettingsProvider>
            <AuthProvider>
              <BillingProvider>
                <DataProvider>
                  <SplashGate>
                    <StatusBar style="dark" />
                    <RootNavigator />
                  </SplashGate>
                </DataProvider>
              </BillingProvider>
            </AuthProvider>
          </SettingsProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
