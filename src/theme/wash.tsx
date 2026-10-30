import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './colors';

/** Soft card lift. Rose-tinted, not a hard drop. */
export const floatShadow = '0 16px 36px rgba(105, 4, 45, 0.14)';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Pagebound / Widgy field: blush into cream, then sage, then a lilac corner. */
export function SoftWash({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.washRose, colors.washCream, colors.washSage, colors.washLilac]}
        locations={[0, 0.36, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(225,129,148,0.42)', 'rgba(251,246,241,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 0.62 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.washCream },
});
