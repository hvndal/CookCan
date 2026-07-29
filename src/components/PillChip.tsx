import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BouncePressable } from '../theme/motion';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function PillChip({ label, selected, onPress }: Props) {
  return (
    <BouncePressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
      accessibilityLabel={label}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </BouncePressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: { color: colors.charcoal, fontWeight: '600', fontSize: 14 },
  textOn: { color: colors.white },
});
