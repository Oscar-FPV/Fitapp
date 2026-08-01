import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

export function BigButton({
  label,
  onPress,
  accent,
  height = 60,
  fontSize = 18,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  accent: string;
  height?: number;
  fontSize?: number;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.big,
        { height, backgroundColor: accent, opacity: disabled ? 0.4 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.bigLabel, { fontSize }]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  flex = true,
}: {
  label: string;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondary,
        flex && { flex: 1 },
        pressed && styles.secondaryPressed,
      ]}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function StepButton({
  label,
  onPress,
  fontSize = 14,
}: {
  label: string;
  onPress: () => void;
  fontSize?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
    >
      <Text style={[styles.stepLabel, { fontSize }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  big: {
    width: '100%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLabel: { fontFamily: fonts.bold, color: '#fff', letterSpacing: 0.6 },
  secondary: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPressed: { borderColor: colors.text },
  secondaryLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  step: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.fillPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPressed: { backgroundColor: colors.fillPillActive },
  stepLabel: { fontFamily: fonts.semibold, color: colors.textSecondary },
});
