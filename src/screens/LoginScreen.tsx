import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearishBackground } from '../components/LinearishBackground';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, signUp, signInLocal } = useAuth();
  const { setLanguagePref, locale, countryLabel } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(action: 'in' | 'up') {
    setLoading(true);
    try {
      if (action === 'in') await signIn(email, password);
      else await signUp(email, password);
    } catch (e) {
      Alert.alert('CookCan', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearishBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.tag}>{t('tagline')}</Text>
        <Text style={styles.region}>
          {t('detectedRegion', { region: countryLabel })} · {locale.currencyCode}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('email')}
            placeholderTextColor={colors.tabInactive}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            accessibilityLabel={t('email')}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t('password')}
            placeholderTextColor={colors.tabInactive}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            accessibilityLabel={t('password')}
          />

          <Button label={t('signIn')} onPress={() => run('in')} loading={loading} />
          <Button
            label={t('signUp')}
            variant="secondary"
            onPress={() => run('up')}
            loading={loading}
            style={{ marginTop: 12 }}
          />
          <Button
            label={t('continueGuest')}
            variant="ghost"
            onPress={() => signInLocal(email || 'cook@cookcan.app')}
            style={{ marginTop: 8 }}
          />
          {locale.language !== 'en' && (
            <Button
              label={t('switchEnglish')}
              variant="ghost"
              onPress={() => setLanguagePref('en')}
              style={{ marginTop: 4 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearishBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 96,
  },
  brand: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: -1.5,
  },
  tag: {
    marginTop: 6,
    fontSize: 18,
    color: colors.muted,
    fontStyle: 'italic',
  },
  region: {
    marginTop: 10,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  form: { marginTop: 40, gap: 12 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 4,
  },
});
