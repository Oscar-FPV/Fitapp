import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { BigButton } from '../components/Buttons';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { sessionTag } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, fonts, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Sessions'>;

export default function SessionsScreen({ navigation }: Props) {
  const templates = useStore((s) => s.templates);
  const exercises = useStore((s) => s.exercises);
  const accent = useStore((s) => s.settings.accent);
  const createTemplate = useStore((s) => s.createTemplate);

  const [newOpen, setNewOpen] = useState(false);
  const [draftName, setDraftName] = useState('');

  const openNew = () => {
    setDraftName('');
    setNewOpen(true);
  };

  const confirmNew = () => {
    const name = draftName.trim();
    if (!name) return;
    const t = createTemplate(name);
    setNewOpen(false);
    navigation.navigate('SessionEdit', { templateId: t.id });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackHeader title="Séances" onBack={() => navigation.goBack()} />
        {exercises.length > 0 ? (
          <Pressable onPress={openNew} style={[styles.addBtn, { backgroundColor: accent }]} hitSlop={8}>
            <Text style={styles.addIcon}>+</Text>
          </Pressable>
        ) : null}
      </View>

      {exercises.length === 0 ? (
        <EmptyState
          title="Créez d'abord des exercices"
          body="Une séance se compose à partir de votre bibliothèque d'exercices. Commencez par en ajouter quelques-uns."
          actionLabel="Aller aux exercices"
          onAction={() => navigation.navigate('Exos')}
          accent={accent}
        />
      ) : templates.length === 0 ? (
        <EmptyState
          title="Aucune séance"
          body="Composez vos séances (PULL, PUSH, Jambes…) une fois, puis placez-les dans le planning quand vous voulez."
          actionLabel="+ Créer une séance"
          onAction={openNew}
          accent={accent}
        />
      ) : (
        templates.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => navigation.navigate('SessionEdit', { templateId: t.id })}
            style={styles.row}
          >
            <View style={[styles.stripe, { backgroundColor: accent }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{t.name}</Text>
              <Text style={styles.rowTag}>{sessionTag(t)}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))
      )}

      <Modal visible={newOpen} transparent animationType="slide" onRequestClose={() => setNewOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setNewOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Nouvelle séance</Text>
            <Text style={styles.sheetSub}>Donnez-lui un nom, vous ajouterez les exercices ensuite.</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="PULL — Hypertrophie"
              placeholderTextColor={colors.textFaintest}
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmNew}
            />
            <BigButton
              label="Continuer"
              onPress={confirmNew}
              accent={accent}
              height={56}
              fontSize={17}
              disabled={!draftName.trim()}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addIcon: { fontFamily: fonts.regular, fontSize: 28, color: '#fff', lineHeight: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 9,
    minHeight: 64,
  },
  stripe: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  rowTag: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 3 },
  chevron: { fontSize: 16, color: '#CFCAC3' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.4, color: colors.text },
  sheetSub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 2, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
    marginBottom: 16,
  },
});
