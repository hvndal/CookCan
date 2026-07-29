import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors } from '../theme/colors';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CookCan crash', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          CookCan hit an unexpected error. You can try again — your pantry and recipes are saved on
          this device.
        </Text>
        <Text style={styles.detail} numberOfLines={4}>
          {this.state.error.message}
        </Text>
        <Button
          label="Try again"
          onPress={() => this.setState({ error: null })}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  body: { marginTop: 10, color: colors.muted, lineHeight: 22 },
  detail: { marginTop: 16, color: colors.tabInactive, fontSize: 12 },
});
