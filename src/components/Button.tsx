import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { BouncePressable, Pulsate } from '../theme/motion';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'google';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  pulse?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  pulse,
}: Props) {
  const isDisabled = disabled || loading;
  const content = (
    <BouncePressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'google' && styles.google,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'google' ? colors.white : colors.primary
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && styles.labelPrimary,
            variant === 'secondary' && styles.labelSecondary,
            variant === 'ghost' && styles.labelGhost,
            variant === 'google' && styles.labelGoogle,
          ]}
        >
          {label}
        </Text>
      )}
    </BouncePressable>
  );

  if (pulse && !isDisabled) {
    return <Pulsate>{content}</Pulsate>;
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondaryContainer,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  google: {
    backgroundColor: colors.charcoal,
  },
  disabled: { opacity: 0.55 },
  label: { fontSize: 16, fontWeight: '700' },
  labelPrimary: { color: colors.white },
  labelSecondary: { color: colors.onSecondaryContainer },
  labelGhost: { color: colors.primaryDark },
  labelGoogle: { color: colors.white },
});
