import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { BigButton } from '../components/Buttons';
import { Pill } from '../components/Pill';
import { Screen } from '../components/Screen';
import { findExercise, MUSCLE_GROUPS } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { MuscleGroup } from '../types/models';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExoEdit'>;

export default function ExoEditScreen({ navigation, route }: Props) {
  const editingId = route.params?.exerciseId;
  const exercises = useStore((s) => s.exercises);
  const accent = useStore((s) => s.settings.accent);
  const addExercise = useStore((s) => s.addExercise);
  const updateExercise = useStore((s) => s.updateExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);
  const templates = useStore((s) => s.templates);

  const existing = editingId ? findExercise(exercises, editingId) : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [group, setGroup] = useState<MuscleGroup>(existing?.group ?? 'Dos');
  const [isWeighted, setIsWeighted] = useState(existing?.isWeighted ?? false);

  const trimmed = name.trim();
  const duplicate = exercises.some(
    (e) => e.id !== editingId && e.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  const canSave = trimmed.length > 0 && !duplicate;

  const save = () => {
    if (!canSave) return;
    if (editingId) updateExercise(editingId, { name: trimmed, group, isWeighted });
    else addExercise({ name: trimmed, group, isWeighted });
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!editingId) return;
    const usedIn = templates.filter((t) =>
      t.exercises.some((te) => te.exerciseId === editingId)
    );
    const warning = usedIn.length
      ? `Il sera aussi retiré de ${usedIn.length} séance${usedIn.length > 1 ? 's' : ''} (${usedIn
          .map((t) => t.name)
          .join(', ')}). L'historique déjà enregistré est conservé.`
      : "L'historique déjà enregistré est conservé.";
    Alert.alert(`Supprimer « ${existing?.name} » ?`, warning, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteExercise(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen>
      <BackHeader
        title={editingId ? "Modifier l'exercice" : 'Nouvel exercice'}
        onBack={() => navigation.goBack()}
      />

      <Text style={styles.label}>Nom</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Rowing barre"
        placeholderTextColor={colors.textFaintest}
        style={styles.input}
        autoFocus={!editingId}
        returnKeyType="done"
        onSubmitEditing={save}
      />
      {duplicate ? <Text style={styles.error}>Un exercice porte déjà ce nom.</Text> : null}

      <Text style={styles.label}>Groupe musculaire</Text>
      <View style={styles.groups}>
        {MUSCLE_GROUPS.map((g) => (
          <Pill key={g} label={g} selected={group === g} onPress={() => setGroup(g)} />
        ))}
      </View>

      <Pressable onPress={() => setIsWeighted((v) => !v)} style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>Exercice lesté</Text>
          <Text style={styles.toggleHint}>
            Poids du corps + charge ajoutée (tractions, dips). Les charges s'affichent « +15 kg ».
          </Text>
        </View>
        <View
          style={[
            styles.switch,
            { backgroundColor: isWeighted ? accent : colors.fillPill },
          ]}
        >
          <View style={[styles.knob, isWeighted && styles.knobOn]} />
        </View>
      </Pressable>

      <BigButton
        label={editingId ? 'Enregistrer' : "Créer l'exercice"}
        onPress={save}
        accent={accent}
        height={60}
        fontSize={17}
        disabled={!canSave}
      />

      {editingId ? (
        <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteLabel}>Supprimer l'exercice</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textFaint,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
  error: { fontFamily: fonts.regular, fontSize: 12.5, color: '#C0392B', marginTop: 8 },
  groups: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  toggleHint: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textFaintest,
    marginTop: 3,
    lineHeight: 18,
  },
  switch: { width: 50, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  deleteBtn: { alignItems: 'center', paddingVertical: 20 },
  deleteLabel: { fontFamily: fonts.medium, fontSize: 14, color: '#C0392B' },
});
