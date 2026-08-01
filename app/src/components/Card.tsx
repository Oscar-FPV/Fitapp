import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/theme';

export function Card({
  children,
  style,
  borderWidth = 1,
  borderColor = colors.border,
  radiusSize = radius.md,
  dashed = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
  radiusSize?: number;
  dashed?: boolean;
}) {
  return (
    <View
      style={[
        styles.base,
        {
          borderWidth,
          borderColor,
          borderRadius: radiusSize,
          borderStyle: dashed ? 'dashed' : 'solid',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.bg },
});
