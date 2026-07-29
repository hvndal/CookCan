import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/** Lightweight gradient-like backdrop without an extra native dep. */
export function LinearishBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.gold,
    opacity: 0.35,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primarySoft,
    opacity: 0.28,
  },
  content: { flex: 1 },
});
