import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeResults'>;

export default function RecipeResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { recipes } = route.params;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Your recipes</Text>
      <Text style={styles.sub}>Generated from your latest scan</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.description}</Text>
            <Text style={styles.meta}>
              {item.cookTimeMinutes} min · {item.difficulty}
              {item.cuisine ? ` · ${item.cuisine}` : ''}
            </Text>
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <Button label="Back to kitchen" onPress={() => navigation.navigate('Main')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal, paddingHorizontal: 20 },
  sub: { color: colors.muted, paddingHorizontal: 20, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.charcoal },
  cardBody: { marginTop: 6, color: colors.muted, lineHeight: 20 },
  meta: { marginTop: 10, color: colors.primaryDark, fontWeight: '700' },
  footer: { padding: 20 },
});
