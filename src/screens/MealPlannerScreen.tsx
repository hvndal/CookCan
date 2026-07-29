import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useBilling } from '../context/BillingContext';
import { useData } from '../context/DataContext';
import { colors } from '../theme/colors';
import type { MealPlanItem } from '../types';

function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MEAL_TYPES: MealPlanItem['mealType'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function MealPlannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { isPro } = useBilling();
  const { meals, addMeal, removeMeal } = useData();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => dateOffset(i)), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [mealType, setMealType] = useState<MealPlanItem['mealType']>('Dinner');
  const [name, setName] = useState('');

  if (!isPro) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 40, paddingHorizontal: 24 }]}>
        <Text style={styles.title}>Meal planner</Text>
        <Text style={styles.sub}>Plan your week with CookCan Pro.</Text>
        <Button
          label="Upgrade to Pro"
          onPress={() => navigation.navigate('Paywall', { reason: 'meal_planner' })}
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  const dayMeals = meals.filter((m) => m.date === selectedDate);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40 }}
    >
      <Text style={styles.title}>Meal planner</Text>
      <Text style={styles.sub}>Map the week so shopping stays intentional.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {days.map((d) => (
          <Pressable
            key={d}
            onPress={() => setSelectedDate(d)}
            style={[styles.day, selectedDate === d && styles.dayOn]}
          >
            <Text style={[styles.dayText, selectedDate === d && styles.dayTextOn]}>
              {d.slice(5)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.chips}>
        {MEAL_TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setMealType(t)}
            style={[styles.chip, mealType === t && styles.chipOn]}
          >
            <Text style={[styles.chipText, mealType === t && styles.chipTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Meal name"
          placeholderTextColor={colors.tabInactive}
        />
        <Button
          label="Add"
          onPress={async () => {
            if (!name.trim()) return;
            await addMeal({ date: selectedDate, mealType, name: name.trim() });
            setName('');
          }}
          style={{ minWidth: 88 }}
        />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {dayMeals.length === 0 ? (
          <Text style={styles.empty}>No meals planned for this day.</Text>
        ) : (
          dayMeals.map((m) => (
            <Pressable key={m.id} onLongPress={() => removeMeal(m.id)} style={styles.row}>
              <Text style={styles.mealType}>{m.mealType}</Text>
              <Text style={styles.mealName}>{m.name}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Button label="Close" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal, paddingHorizontal: 20 },
  sub: { color: colors.muted, paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  days: { paddingHorizontal: 20, gap: 8 },
  day: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontWeight: '700', color: colors.charcoal },
  dayTextOn: { color: colors.white },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  chipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  chipTextOn: { color: colors.primaryDark },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginVertical: 16,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  mealType: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  mealName: { color: colors.charcoal, fontSize: 17, fontWeight: '700', marginTop: 2 },
  empty: { color: colors.muted },
});
