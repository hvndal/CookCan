import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
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
import { logoMark } from '../theme/assets';
import { photos } from '../theme/photos';
import { BouncePressable } from '../theme/motion';
import { colors } from '../theme/colors';

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInLocal, signInWithGoogle, sendMagicLink } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, [pulse]);

  const splashLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  async function runGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not sign in';
      setError(msg);
      Alert.alert('Google', msg);
    } finally {
      setLoading(false);
    }
  }

  async function runMagicLink() {
    setLoading(true);
    setError(null);
    try {
      await sendMagicLink(email);
      setLinkSentTo(email.trim().toLowerCase());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Image source={photos.salmon} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(225,129,148,0.22)', 'rgba(27,28,26,0.42)', colors.rose]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.wrap,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.header}>
          <Image source={logoMark} style={styles.heroLogo} contentFit="contain" accessibilityLabel="CookCan" />
          <Text style={styles.kicker}>Scan. Select. Savor.</Text>
          <Text style={styles.sub}>Gemini curates from what you already have.</Text>
        </View>

        <View style={styles.card}>
          {linkSentTo ? (
            <>
              <Text style={styles.cardTitle}>Check your inbox</Text>
              <Text style={styles.cardSub}>
                We sent a sign-in link to {linkSentTo}. Open it on this phone.
              </Text>
              <Button
                label="Use a different email"
                variant="ghost"
                onPress={() => {
                  setLinkSentTo(null);
                  setEmail('');
                }}
                style={{ marginTop: 8 }}
              />
            </>
          ) : (
            <>
              <BouncePressable
                onPress={runGoogle}
                disabled={loading}
                accessibilityLabel="Continue with Google"
                style={styles.googleBtn}
              >
                {loading ? (
                  <ActivityIndicator color={colors.charcoal} />
                ) : (
                  <View style={styles.googleRow}>
                    <GoogleMark />
                    <Text style={styles.googleLabel}>Continue with Google</Text>
                  </View>
                )}
              </BouncePressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
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
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (email.trim()) void runMagicLink();
                }}
              />
              <Button
                label="Email me a link"
                onPress={runMagicLink}
                loading={loading}
                disabled={!email.trim()}
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Continue as guest"
            variant="ghost"
            onPress={() => signInLocal(email || 'cook@cookcan.app')}
            style={{ marginTop: 4 }}
          />
        </View>
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
  wrap: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
    paddingHorizontal: 22,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: 8 },
  heroLogo: { width: '88%', height: 128 },
  kicker: {
    marginTop: 2,
    fontFamily: serif,
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 12,
    opacity: 0.92,
  },
  card: {
    backgroundColor: 'rgba(251,249,245,0.94)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.charcoal,
    textAlign: 'center',
  },
  cardSub: {
    marginTop: 8,
    marginBottom: 4,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  googleBtn: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 18,
  },
  googleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  googleLabel: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.outlineVariant },
  orText: { fontSize: 12, fontWeight: '700', color: colors.tabInactive, letterSpacing: 0.4 },
  error: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: colors.error,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.white,
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
  splashLogo: { width: 300, height: 240 },
});
