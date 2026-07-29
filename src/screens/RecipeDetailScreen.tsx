import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getRecipe } = useData();
  const recipe = getRecipe(route.params.recipeId);

  if (!recipe) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <Text style={styles.title}>Recipe not found</Text>
        <Button label="Go back" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40, paddingHorizontal: 20 }}
    >
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.meta}>
        {recipe.cookTimeMinutes} min · {recipe.difficulty}
        {recipe.cuisine ? ` · ${recipe.cuisine}` : ''}
      </Text>
      <Text style={styles.body}>{recipe.description}</Text>

      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredients.map((ing, i) => (
        <Text key={`${ing}-${i}`} style={styles.bullet}>
          • {ing}
        </Text>
      ))}

      <Text style={styles.section}>Steps</Text>
      {recipe.steps.map((step, i) => (
        <Text key={`${i}`} style={styles.step}>
          {i + 1}. {step}
        </Text>
      ))}

      <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal },
  meta: { marginTop: 8, color: colors.primaryDark, fontWeight: '700' },
  body: { marginTop: 12, color: colors.muted, lineHeight: 22, fontSize: 16 },
  section: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  bullet: { color: colors.charcoal, marginBottom: 6, fontSize: 16 },
  step: { color: colors.charcoal, marginBottom: 10, fontSize: 16, lineHeight: 22 },
});
