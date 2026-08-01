import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'];

export function NumberPad({
  visible,
  label,
  initialValue,
  allowDecimal,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  label: string;
  initialValue: number;
  allowDecimal: boolean;
  onCancel: () => void;
  onConfirm: (value: number) => void;
}) {
  const [buf, setBuf] = useState(String(initialValue));
  // The pad opens pre-filled with the current value; the first keypress starts a
  // fresh entry instead of appending to it.
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setBuf(String(initialValue));
      setTouched(false);
    }
  }, [visible, initialValue]);

  const press = (k: string) => {
    if (k === '⌫') {
      setTouched(true);
      setBuf((b) => (touched ? b.slice(0, -1) : ''));
      return;
    }
    const base = touched ? buf : '';
    if (k === ',' && (!allowDecimal || base.includes('.'))) return;
    if (base.length >= 6) return;
    setTouched(true);
    setBuf(base + (k === ',' ? '.' : k));
  };

  const confirm = () => {
    const v = parseFloat(buf);
    if (!isNaN(v)) onConfirm(v);
    else onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{buf === '' ? '—' : buf.replace('.', ',')}</Text>
          </View>
          <View style={styles.grid}>
            {KEYS.map((k) => (
              <Pressable
                key={k}
                onPress={() => press(k)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyLabel}>{k}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={confirm} style={styles.ok}>
            <Text style={styles.okLabel}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(19,18,17,.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 26,
  },
  header: { alignItems: 'center', marginBottom: 14 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  value: { fontFamily: fonts.bold, fontSize: 52, letterSpacing: -1, color: colors.text, lineHeight: 62 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  key: {
    flexBasis: '31%',
    flexGrow: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.fillPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: colors.fillPillActive },
  keyLabel: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  ok: {
    height: 56,
    marginTop: 9,
    borderRadius: 14,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okLabel: { fontFamily: fonts.semibold, fontSize: 17, color: '#fff' },
});
