import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  accent,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  accent?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={[styles.action, { borderColor: accent ?? colors.text }]}>
          <Text style={[styles.actionLabel, { color: accent ?? colors.text }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, marginBottom: 6 },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: 18,
    height: 46,
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: fonts.semibold, fontSize: 14 },
});
