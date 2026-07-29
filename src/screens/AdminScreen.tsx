import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { grantProToEmail, revokeProFromEmail } from '../lib/entitlements';
import { isFirebaseConfigured } from '../lib/firebase';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { colors } from '../theme/colors';

export default function AdminScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.title}>{t('adminTitle')}</Text>
        <Text style={styles.sub}>{t('adminDenied')}</Text>
        <Button label={t('close')} onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  async function runGrant() {
    const target = email.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      Alert.alert(t('adminTitle'), t('adminInvalidEmail'));
      return;
    }
    if (!isFirebaseConfigured) {
      Alert.alert(t('adminTitle'), t('adminFirebaseMissing'));
      return;
    }
    setBusy(true);
    try {
      await grantProToEmail(target, user?.email ?? 'admin');
      Alert.alert(t('adminGrantedTitle'), t('adminGrantedBody', { email: target }));
      setEmail('');
    } catch (e) {
      Alert.alert(t('adminTitle'), e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function runRevoke() {
    const target = email.trim().toLowerCase();
    if (!target || !target.includes('@')) {
      Alert.alert(t('adminTitle'), t('adminInvalidEmail'));
      return;
    }
    setBusy(true);
    try {
      await revokeProFromEmail(target);
      Alert.alert(t('adminRevokedTitle'), t('adminRevokedBody', { email: target }));
    } catch (e) {
      Alert.alert(t('adminTitle'), e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
    >
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
        <Text style={styles.back}>{t('back')}</Text>
      </Pressable>
      <Text style={styles.title}>{t('adminTitle')}</Text>
      <Text style={styles.sub}>{t('adminSub')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('adminEmailLabel')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="friend@example.com"
          placeholderTextColor={colors.tabInactive}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Button
          label={t('adminGrant')}
          onPress={() => runGrant()}
          loading={busy}
          style={{ marginTop: 14 }}
        />
        <Button
          label={t('adminRevoke')}
          variant="secondary"
          onPress={() => runRevoke()}
          loading={busy}
          style={{ marginTop: 10 }}
        />
      </View>

      <Text style={styles.hint}>{t('adminHint')}</Text>
      <Button label={t('close')} variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  back: { color: colors.primaryDark, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.muted, marginTop: 6, lineHeight: 22 },
  card: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.charcoal,
  },
  hint: { marginTop: 18, color: colors.muted, fontSize: 13, lineHeight: 20 },
});
