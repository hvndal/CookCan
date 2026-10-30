import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { BouncePressable, ConfettiEffect, Pulsate } from '../theme/motion';
import { useData } from '../context/DataContext';
import { analyzeIngredientImage } from '../lib/gemini';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

export default function ScanningScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Scanning'>>();
  const intent = route.params?.intent ?? 'fridge';
  const title = intent === 'list' ? 'Scan an ingredient list' : 'Scan the fridge';
  const hint =
    intent === 'list'
      ? 'A handwritten list, receipt, or package label. Gemini reads the words into the pantry.'
      : 'Point at the shelves or the counter. Gemini reads what you can cook with.';
  const { addPantryItems, consumeScan, canScan } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const laser = useSharedValue(0);

  useEffect(() => {
    laser.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [laser]);

  const laserStyle = useAnimatedStyle(() => ({
    top: `${8 + laser.value * 70}%`,
  }));

  async function processBase64(base64: string, mimeType = 'image/jpeg') {
    if (!canScan) {
      navigation.replace('Paywall', { reason: 'scan_limit' });
      return;
    }
    setBusy(true);
    try {
      const ok = await consumeScan();
      if (!ok) {
        navigation.replace('Paywall', { reason: 'scan_limit' });
        return;
      }
      const ingredients = await analyzeIngredientImage(base64, mimeType);
      await addPantryItems(
        ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          category: i.category,
          confidence: 0.9,
        }))
      );
      setConfetti(true);
      setTimeout(() => {
        navigation.replace('RecipeRefine', {
          ingredients: ingredients.map((i) => i.name),
        });
      }, 700);
    } catch (e) {
      Alert.alert('Scan failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setBusy(false);
    }
  }

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({
      base64: true,
      quality: 0.6,
    });
    if (photo?.base64) await processBase64(photo.base64);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      await processBase64(result.assets[0].base64, result.assets[0].mimeType ?? 'image/jpeg');
    }
  }

  if (!permission?.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 34 }}>📷</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{hint}</Text>
        <Button label="Allow camera" onPress={requestPermission} style={{ marginTop: 24 }} pulse />
        <Button
          label="Choose from gallery"
          variant="secondary"
          onPress={pickImage}
          style={{ marginTop: 12 }}
          loading={busy}
        />
        <Button label="Close" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 8 }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ConfettiEffect trigger={confetti} />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <Animated.View style={[styles.laser, laserStyle]} />
      <View style={[styles.overlay, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.overlayTitle}>{title}</Text>
        <Text style={styles.overlaySub}>
          {busy ? 'Gemini is reading the frame…' : hint}
        </Text>
        <View style={styles.actions}>
          <Button label="Gallery" variant="secondary" onPress={pickImage} disabled={busy} />
          <Pulsate>
            <BouncePressable onPress={takePhoto} disabled={busy} style={styles.shutter}>
              <View style={styles.shutterInner} />
            </BouncePressable>
          </Pulsate>
          <Button label="Close" variant="ghost" onPress={() => navigation.goBack()} disabled={busy} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  center: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  sub: { marginTop: 10, color: colors.muted, lineHeight: 22, textAlign: 'center' },
  laser: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    zIndex: 2,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  overlayTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 8,
  },
  overlaySub: { color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
  },
});
