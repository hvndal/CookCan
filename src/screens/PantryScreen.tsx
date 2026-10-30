import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { colors } from '../theme/colors';
import { Image } from 'expo-image';
import { photoForCategory } from '../theme/photos';
import { Button } from '../components/Button';

const CATEGORIES = ['All', 'Produce', 'Meat', 'Dairy', 'Pantry', 'Spices', 'Other'];

export default function PantryScreen() {
  const insets = useSafeAreaInsets();
  const { pantry, addPantryItems, removePantryItem } = useData();
  const [category, setCategory] = useState('All');
  const [name, setName] = useState('');

  const filtered = useMemo(
    () =>
      pantry.filter(
        (p) => category === 'All' || p.category === category
      ),
    [pantry, category]
  );

  async function addManual() {
    if (!name.trim()) return;
    await addPantryItems([
      {
        name: name.trim(),
        quantity: 1,
        unit: 'pcs',
        category: category === 'All' ? 'Other' : category,
      },
    ]);
    setName('');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Pantry</Text>
      <Text style={styles.sub}>{pantry.length} ingredients ready to cook</Text>

      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipOn]}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Add ingredient"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Add ingredient"
        />
        <Button label="Add" onPress={addManual} style={{ minWidth: 88 }} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Your pantry is empty. Scan or add items.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() =>
              Alert.alert('Remove item?', item.name, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => removePantryItem(item.id),
                },
              ])
            }
            style={styles.row}
          >
            <Image source={photoForCategory(item.category)} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.quantity} {item.unit} · {item.category}
                {item.freshness ? ` · ${item.freshness}` : ''}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.charcoal,
    paddingHorizontal: 20,
  },
  sub: { color: colors.muted, paddingHorizontal: 20, marginTop: 4, marginBottom: 14 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.charcoal, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: colors.white },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.charcoal,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  thumb: { width: 56, height: 56, borderRadius: 14 },
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  meta: { color: colors.muted, marginTop: 3 },
  empty: { color: colors.muted, marginTop: 24 },
});
