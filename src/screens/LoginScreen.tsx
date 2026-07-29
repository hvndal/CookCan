import React, { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../lib/firebase';
import { REMOTE } from '../theme/assets';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInLocal, signInWithGoogle } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600, easing: Easing.linear }),
        withTiming(0.95, { duration: 600, easing: Easing.linear })
      ),
      -1,
      false
    );
    const t = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(t);
  }, [pulse]);

  const splashLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  async function runEmail() {
    setLoading(true);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (e) {
      Alert.alert('CookCan', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function runGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Google Sign-In', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: REMOTE.kitchenBg }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['transparent', 'rgba(251,249,245,0.45)', colors.cream]}
          locations={[0.2, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.wrap, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.header}>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>CookCan</Text>
          </View>
          <Text style={styles.headline}>Crafting flavor{'\n'}with precision.</Text>
          <Text style={styles.sub}>
            Step into your private chef&apos;s atelier. Scan your ingredients and let AI design your
            next masterpiece.
          </Text>
        </View>

        <View style={styles.card}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isFirebaseConfigured ? colors.successSoft : colors.warningSoft },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: isFirebaseConfigured ? '#4CAF50' : '#FF9800' },
              ]}
            />
            <Text
              style={{
                fontWeight: '700',
                fontSize: 11,
                color: isFirebaseConfigured ? colors.success : colors.warning,
              }}
            >
              {isFirebaseConfigured ? 'Firebase Live Sync' : 'Local / Sandbox Mode'}
            </Text>
          </View>

          <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.cardSub}>
            {isSignUp
              ? 'Sign up to backup your custom recipes'
              : 'Sign in to restore your culinary profile'}
          </Text>

          <Button
            label="Continue with Google"
            variant="google"
            onPress={runGoogle}
            loading={loading}
            style={{ marginTop: 16 }}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or email</Text>
            <View style={styles.orLine} />
          </View>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={colors.tabInactive}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6)"
            placeholderTextColor={colors.tabInactive}
            secureTextEntry
            textContentType="password"
            autoComplete={isSignUp ? 'new-password' : 'password'}
          />

          <Button
            label={isSignUp ? 'Create Account' : 'Sign In'}
            onPress={runEmail}
            loading={loading}
            style={{ marginTop: 4 }}
          />
          <Button
            label={isSignUp ? 'Have an account? Sign In' : 'New to CookCan? Create Account'}
            variant="ghost"
            onPress={() => setIsSignUp((v) => !v)}
            style={{ marginTop: 4 }}
          />
          <Button
            label="Explore as Guest"
            variant="secondary"
            onPress={() => signInLocal(email || 'cook@cookcan.app')}
            style={{ marginTop: 4 }}
          />
        </View>
      </KeyboardAvoidingView>

      {showSplash && (
        <Animated.View style={[styles.splash, { opacity: 1 }]}>
          <Animated.View style={splashLogoStyle}>
            <Image source={{ uri: REMOTE.logo }} style={styles.splashLogo} contentFit="contain" />
          </Animated.View>
          <Text style={styles.splashBrand}>CookCan</Text>
          <Text style={styles.splashTag}>SCAN • SELECT • SAVOR</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: 12 },
  brandPill: {
    backgroundColor: 'rgba(240,114,147,0.22)',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  brandPillText: {
    color: colors.primary,
    fontStyle: 'italic',
    fontWeight: '800',
    fontSize: 18,
  },
  headline: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sub: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.charcoal,
    textAlign: 'center',
  },
  cardSub: {
    marginTop: 4,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 13,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.outlineVariant },
  orText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 10,
  },
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  splashLogo: { width: 96, height: 96, marginBottom: 18 },
  splashBrand: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  splashTag: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: '700',
  },
});
