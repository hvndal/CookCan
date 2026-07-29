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
import { LinearishBackground } from '../components/LinearishBackground';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { signIn, signUp, signInLocal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(action: 'in' | 'up') {
    setLoading(true);
    try {
      if (action === 'in') await signIn(email, password);
      else await signUp(email, password);
    } catch (e) {
      Alert.alert('Auth error', e instanceof Error ? e.message : 'Failed');
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
        <Text style={styles.brand}>CookCan</Text>
        <Text style={styles.tag}>Scan. Cook. Enjoy.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@address.com"
            placeholderTextColor={colors.tabInactive}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            accessibilityLabel="Email address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.tabInactive}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            accessibilityLabel="Password"
          />

          <Button label="Sign in" onPress={() => run('in')} loading={loading} />
          <Button
            label="Sign up"
            variant="secondary"
            onPress={() => run('up')}
            loading={loading}
            style={{ marginTop: 12 }}
          />
          <Button
            label="Continue without account"
            variant="ghost"
            onPress={() => signInLocal(email || 'cook@cookcan.app')}
            style={{ marginTop: 8 }}
          />
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
  form: { marginTop: 48, gap: 12 },
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
