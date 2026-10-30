import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Rect } from 'react-native-svg';
import { colors } from './colors';

type BounceProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function BouncePressable({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
}: BounceProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 280 });
        void Haptics.selectionAsync();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 180 });
      }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
    >
      <Animated.View style={[animated, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Pulsate({
  children,
  style,
  min = 0.96,
  max = 1.04,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  min?: number;
  max?: number;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(max, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(min, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => cancelAnimation(scale);
  }, [max, min, scale]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

const CONFETTI_COLORS = [
  '#FF5722',
  '#4CAF50',
  '#2196F3',
  '#FFEB3B',
  '#E91E63',
  '#9C27B0',
];

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
};

export function ConfettiEffect({
  trigger,
  onFinished,
}: {
  trigger: boolean;
  onFinished?: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const next: Particle[] = Array.from({ length: 42 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 6;
      return {
        id: i,
        x: 0.5,
        y: 0.38,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 16 - 8,
        alpha: 1,
      };
    });
    setParticles(next);
    setRunning(true);
  }, [trigger]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setParticles((prev) => {
        const updated = prev.map((p) => ({
          ...p,
          x: p.x + p.vx * 0.0022,
          y: p.y + p.vy * 0.0022 + 0.004,
          vy: p.vy + 0.28,
          rotation: p.rotation + p.rotSpeed,
          alpha: Math.max(0, p.alpha - 0.018),
        }));
        if (updated.every((p) => p.alpha <= 0.05) || frame > 90) {
          clearInterval(id);
          setRunning(false);
          onFinished?.();
        }
        return updated;
      });
    }, 16);
    return () => clearInterval(id);
  }, [running, onFinished]);

  if (!running) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        {particles.map((p) => (
          <Rect
            key={p.id}
            x={`${p.x * 100}%`}
            y={`${p.y * 100}%`}
            width={p.size}
            height={p.size * 1.4}
            fill={p.color}
            opacity={p.alpha}
            rotation={p.rotation}
            origin={`${p.x * 100}, ${p.y * 100}`}
          />
        ))}
      </Svg>
    </View>
  );
}

export function ThinkingLoader({
  status,
  progress,
}: {
  status: string;
  progress: number;
}) {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700 }),
        withTiming(0.95, { duration: 700 })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(rotate);
      cancelAnimation(pulse);
    };
  }, [pulse, rotate]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));

  return (
    <View style={styles.loaderWrap}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.core, coreStyle]}>
        <View style={styles.coreInner} />
      </Animated.View>
      <Animated.Text style={styles.loaderTitle}>Chef is Crafting...</Animated.Text>
      <Animated.Text style={styles.loaderStatus}>{status}</Animated.Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Animated.Text style={styles.loaderPct}>{pct}%</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.cream,
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 28,
  },
  core: {
    position: 'absolute',
    top: '34%',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  loaderTitle: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '700',
    color: colors.charcoal,
    fontStyle: 'italic',
  },
  loaderStatus: {
    marginTop: 10,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  barTrack: {
    marginTop: 28,
    width: '80%',
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  loaderPct: {
    marginTop: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
