import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export function LinearishBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.primaryContainer, colors.cream, colors.secondaryContainer]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
    backgroundColor: colors.primaryContainer,
    opacity: 0.28,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.secondaryContainer,
    opacity: 0.45,
  },
  content: { flex: 1 },
});
