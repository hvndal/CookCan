import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
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
import { firebaseConfig, isFirebaseConfigured } from '../lib/firebase';
import { logoMark } from '../theme/assets';
import { photos } from '../theme/photos';
import { colors } from '../theme/colors';

type Mode = 'email' | 'phone';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const {
    signIn,
    signUp,
    signInLocal,
    signInWithGoogle,
    sendPhoneCode,
    confirmPhoneCode,
    phoneCodeSent,
    resetPhoneAuth,
  } = useAuth();
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<Mode>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
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

  async function runSendPhone() {
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        throw new Error('reCAPTCHA not ready — try again in a second');
      }
      await sendPhoneCode(phone, recaptchaRef.current);
      Alert.alert('Code sent', 'Check your SMS for the 6-digit code.');
    } catch (e) {
      Alert.alert('Phone login', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function runConfirmPhone() {
    setLoading(true);
    try {
      await confirmPhoneCode(otp);
    } catch (e) {
      Alert.alert('Phone login', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification
      />

      <Image source={photos.salmon} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(225,129,148,0.28)', 'rgba(27,28,26,0.55)', colors.rose]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.wrap, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 12 }]}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={logoMark} style={styles.heroLogo} contentFit="contain" accessibilityLabel="CookCan" />
            <Text style={styles.sub}>
              Scan the fridge, scan a list, or type what you have. Gemini curates the meal. Cuisine and
              goals set the direction.
            </Text>
          </View>

          <View style={styles.card}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isFirebaseConfigured
                    ? colors.successSoft
                    : colors.warningSoft,
                },
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

            <Text style={styles.cardTitle}>
              {mode === 'phone'
                ? phoneCodeSent
                  ? 'Enter SMS code'
                  : 'Sign in with Phone'
                : isSignUp
                  ? 'Create Account'
                  : 'Welcome Back'}
            </Text>
            <Text style={styles.cardSub}>
              {mode === 'phone'
                ? 'We will text you a one-time code'
                : isSignUp
                  ? 'Sign up to backup your custom recipes'
                  : 'Sign in to restore your culinary profile'}
            </Text>

            <Button
              label="Continue with Google"
              variant="google"
              onPress={runGoogle}
              loading={loading}
              style={{ marginTop: 14 }}
            />

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => {
                  setMode('email');
                  resetPhoneAuth();
                }}
                style={[styles.modeChip, mode === 'email' && styles.modeChipOn]}
              >
                <Text style={[styles.modeText, mode === 'email' && styles.modeTextOn]}>Email</Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('phone')}
                style={[styles.modeChip, mode === 'phone' && styles.modeChipOn]}
              >
                <Text style={[styles.modeText, mode === 'phone' && styles.modeTextOn]}>Phone</Text>
              </Pressable>
            </View>

            {mode === 'email' ? (
              <>
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
                />
                <Button
                  label={isSignUp ? 'Have an account? Sign In' : 'New to CookCan? Create Account'}
                  variant="ghost"
                  onPress={() => setIsSignUp((v) => !v)}
                  style={{ marginTop: 4 }}
                />
              </>
            ) : (
              <>
                {!phoneCodeSent ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Phone +1 415 555 2671"
                      placeholderTextColor={colors.tabInactive}
                      keyboardType="phone-pad"
                      textContentType="telephoneNumber"
                      autoComplete="tel"
                    />
                    <Button
                      label="Send SMS code"
                      onPress={runSendPhone}
                      loading={loading}
                      pulse
                    />
                  </>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="6-digit code"
                      placeholderTextColor={colors.tabInactive}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={6}
                    />
                    <Button
                      label="Verify & enter kitchen"
                      onPress={runConfirmPhone}
                      loading={loading}
                      pulse
                    />
                    <Button
                      label="Use a different number"
                      variant="ghost"
                      onPress={() => {
                        resetPhoneAuth();
                        setOtp('');
                      }}
                      style={{ marginTop: 4 }}
                    />
                  </>
                )}
              </>
            )}

            <Button
              label="Explore as Guest"
              variant="secondary"
              onPress={() => signInLocal(email || phone || 'cook@cookcan.app')}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showSplash && (
        <Animated.View style={styles.splash}>
          <Animated.View style={splashLogoStyle}>
            <Image source={logoMark} style={styles.splashLogo} contentFit="contain" accessibilityLabel="CookCan" />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.rose },
  wrap: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginTop: 4, marginBottom: 12 },
  heroLogo: { width: '100%', height: 168 },
  sub: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  modeChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeText: { fontWeight: '700', color: colors.charcoal },
  modeTextOn: { color: colors.white },
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
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  splashLogo: { width: 360, height: 280 },
});
