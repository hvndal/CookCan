import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useData } from '../context/DataContext';
import { analyzeIngredientImage, generateRecipesFromPantry } from '../lib/gemini';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

export default function ScanningScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addPantryItems, saveRecipes, consumeScan, canScan, diets } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

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
      const recipes = await generateRecipesFromPantry(
        ingredients.map((i) => i.name),
        diets
      );
      await saveRecipes(recipes);
      navigation.replace('RecipeResults', { recipes });
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
        <Text style={styles.title}>Camera access</Text>
        <Text style={styles.sub}>CookCan needs the camera to scan ingredients.</Text>
        <Button label="Allow camera" onPress={requestPermission} style={{ marginTop: 20 }} />
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
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View style={[styles.overlay, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.overlayTitle}>Point at ingredients</Text>
        <Text style={styles.overlaySub}>We’ll detect items and draft recipes</Text>
        <View style={styles.actions}>
          <Button label="Gallery" variant="secondary" onPress={pickImage} disabled={busy} />
          <Button label={busy ? 'Analyzing…' : 'Capture'} onPress={takePhoto} loading={busy} />
          <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} disabled={busy} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  sub: { marginTop: 8, color: colors.muted, lineHeight: 22 },
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
  actions: { gap: 10 },
});
