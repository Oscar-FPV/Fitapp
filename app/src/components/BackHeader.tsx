import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/theme';

export function BackHeader({
  title,
  onBack,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable hitSlop={8} onPress={onBack} style={styles.back}>
        <Text style={styles.arrow}>←</Text>
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginLeft: -8 },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { fontSize: 20, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.4, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
});
