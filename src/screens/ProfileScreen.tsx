import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../context/BillingContext';
import { useData } from '../context/DataContext';
import { FREE_SCANS_PER_MONTH, PLANS } from '../constants/billing';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { user, signOut, isLocalUser } = useAuth();
  const { isPro, localizedPrice, restorePurchases, deactivateProMock } = useBilling();
  const { scansUsed, scansRemaining } = useData();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40, paddingHorizontal: 20 }}
    >
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>{user?.email ?? 'Guest cook'}</Text>
      {isLocalUser && (
        <Text style={styles.badge}>Local session (Supabase key not configured)</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Plan</Text>
        <Text style={styles.cardValue}>{isPro ? PLANS.pro.name : PLANS.free.name}</Text>
        <Text style={styles.cardMeta}>
          {isPro
            ? `Active · ${localizedPrice}`
            : `${scansUsed}/${FREE_SCANS_PER_MONTH} scans used · ${scansRemaining} left`}
        </Text>
      </View>

      {!isPro && (
        <Button
          label="Upgrade to Pro"
          onPress={() => navigation.navigate('Paywall', { reason: 'profile' })}
          style={{ marginTop: 16 }}
        />
      )}

      <Button
        label="Restore purchases"
        variant="secondary"
        onPress={() => restorePurchases()}
        style={{ marginTop: 12 }}
      />

      {isPro && __DEV__ && (
        <Button
          label="Dev: downgrade to Free"
          variant="ghost"
          onPress={() => deactivateProMock()}
          style={{ marginTop: 8 }}
        />
      )}

      <Button
        label="Sign out"
        variant="ghost"
        onPress={() => {
          Alert.alert('Sign out?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign out',
              style: 'destructive',
              onPress: async () => {
                await signOut();
              },
            },
          ]);
        }}
        style={{ marginTop: 24 }}
      />

      <Button label="Close" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.muted, marginTop: 4 },
  badge: {
    marginTop: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  cardValue: { fontSize: 24, fontWeight: '800', color: colors.charcoal, marginTop: 6 },
  cardMeta: { color: colors.muted, marginTop: 6 },
});
