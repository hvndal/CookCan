import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useData } from '../context/DataContext';
import { colors } from '../theme/colors';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const { shopping, addShoppingItem, toggleShoppingItem, removeShoppingItem } = useData();
  const [name, setName] = useState('');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Grocery</Text>
      <Text style={styles.sub}>Shopping list for your next cook</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Milk, lemons…"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Add grocery item"
        />
        <Button
          label="Add"
          onPress={async () => {
            if (!name.trim()) return;
            await addShoppingItem(name.trim(), 'Produce');
            setName('');
          }}
          style={{ minWidth: 88 }}
        />
      </View>

      <FlatList
        data={shopping}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.empty}>No grocery items yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleShoppingItem(item.id)}
            onLongPress={() => removeShoppingItem(item.id)}
            style={styles.row}
          >
            <View style={[styles.check, item.checked && styles.checkOn]} />
            <Text style={[styles.name, item.checked && styles.checked]}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal, paddingHorizontal: 20 },
  sub: { color: colors.muted, paddingHorizontal: 20, marginTop: 4, marginBottom: 14 },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkOn: { backgroundColor: colors.primary },
  name: { fontSize: 16, color: colors.charcoal, fontWeight: '600' },
  checked: { textDecorationLine: 'line-through', color: colors.muted },
  empty: { color: colors.muted, marginTop: 24 },
});
