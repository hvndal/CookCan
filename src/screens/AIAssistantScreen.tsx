import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useBilling } from '../context/BillingContext';
import { useData } from '../context/DataContext';
import { chatWithChef } from '../lib/gemini';
import { colors } from '../theme/colors';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { isPro } = useBilling();
  const { chat, appendChat, pantry } = useData();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isPro) {
    return (
      <View style={[styles.locked, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>AI Chef</Text>
        <Text style={styles.sub}>
          Chat with your kitchen companion about techniques, substitutions, and plating.
          Included with CookCan Pro.
        </Text>
        <Button
          label="See Pro plans"
          onPress={() => navigation.navigate('Paywall', { reason: 'ai_chef' })}
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  async function send() {
    if (!input.trim() || loading) return;
    const message = input.trim();
    setInput('');
    setLoading(true);
    await appendChat('user', message);
    try {
      const reply = await chatWithChef(
        [...chat, { role: 'user', content: message }],
        pantry.map((p) => p.name)
      );
      await appendChat('assistant', reply);
    } catch (e) {
      await appendChat(
        'assistant',
        e instanceof Error ? e.message : 'I could not reply right now.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + 8 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={12}
    >
      <Text style={styles.title}>AI Chef</Text>
      <Text style={styles.sub}>Ask about recipes, techniques, or what to cook tonight.</Text>
      <FlatList
        data={chat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' && { color: colors.white },
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="How do I sear salmon?"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Message AI Chef"
        />
        <Button label="Send" onPress={send} loading={loading} style={{ minWidth: 88 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  locked: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: 24 },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal, paddingHorizontal: 20 },
  sub: { color: colors.muted, paddingHorizontal: 20, marginTop: 6, lineHeight: 22 },
  bubble: { maxWidth: '88%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  bubbleText: { color: colors.charcoal, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outline,
    backgroundColor: colors.cream,
    paddingTop: 10,
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
});
