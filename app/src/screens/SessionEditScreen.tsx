import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { EmptyState } from '../components/EmptyState';
import { NumberStepper } from '../components/NumberStepper';
import { Screen } from '../components/Screen';
import { findExercise, findTemplate, estimatedMinutes, totalSets } from '../data/catalog';
import { RootStackParamList } from '../navigation/types';
import { useStore } from '../store/useStore';
import { colors, fonts, radius } from '../theme/theme';
import { fmtKg, mmss, scaleLabel, scaleValue } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionEdit'>;

export default function SessionEditScreen({ navigation, route }: Props) {
  const { templateId } = route.params;
  const templates = useStore((s) => s.templates);
  const exercises = useStore((s) => s.exercises);
  const settings = useStore((s) => s.settings);
  const renameTemplate = useStore((s) => s.renameTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);
  const addExerciseToTemplate = useStore((s) => s.addExerciseToTemplate);
  const removeExerciseFromTemplate = useStore((s) => s.removeExerciseFromTemplate);
  const updateTemplateExercise = useStore((s) => s.updateTemplateExercise);
  const moveTemplateExercise = useStore((s) => s.moveTemplateExercise);

  const template = findTemplate(templates, templateId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(template?.name ?? '');

  if (!template) {
    return (
      <Screen>
        <BackHeader title="Séance" onBack={() => navigation.goBack()} />
        <Text style={styles.gone}>Cette séance n'existe plus.</Text>
      </Screen>
    );
  }

  const accent = settings.accent;

  const commitName = () => {
    const n = nameDraft.trim();
    if (n) renameTemplate(template.id, n);
    else setNameDraft(template.name);
  };

  const confirmDelete = () =>
    Alert.alert(
      `Supprimer « ${template.name} » ?`,
      'Elle sera retirée du planning. Les séances déjà réalisées restent dans l\'historique.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteTemplate(template.id);
            navigation.goBack();
          },
        },
      ]
    );

  // Exercises not yet in this session — the picker only offers new ones.
  const available = exercises.filter(
    (e) => !template.exercises.some((te) => te.exerciseId === e.id)
  );

  return (
    <Screen>
      <BackHeader title="Séance" onBack={() => navigation.goBack()} />

      <TextInput
        value={nameDraft}
        onChangeText={setNameDraft}
        onBlur={commitName}
        onSubmitEditing={commitName}
        placeholder="Nom de la séance"
        placeholderTextColor={colors.textFaintest}
        style={styles.nameInput}
        returnKeyType="done"
      />
      <Text style={styles.summary}>
        {template.exercises.length} exo{template.exercises.length > 1 ? 's' : ''} ·{' '}
        {totalSets(template.exercises)} séries · ~{estimatedMinutes(template.exercises)} min
      </Text>

      {template.exercises.length === 0 ? (
        <EmptyState
          title="Séance vide"
          body="Ajoutez les exercices de cette séance, puis réglez séries, reps, charge et repos."
          actionLabel="+ Ajouter un exercice"
          onAction={() => setPickerOpen(true)}
          accent={accent}
        />
      ) : (
        template.exercises.map((te, i) => {
          const def = findExercise(exercises, te.exerciseId);
          const prefix = def.isWeighted ? '+' : '';
          return (
            <View key={`${te.exerciseId}-${i}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{def.name}</Text>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => moveTemplateExercise(template.id, i, -1)}
                    disabled={i === 0}
                    hitSlop={6}
                    style={styles.iconBtn}
                  >
                    <Text style={[styles.icon, i === 0 && styles.iconDisabled]}>↑</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => moveTemplateExercise(template.id, i, 1)}
                    disabled={i === template.exercises.length - 1}
                    hitSlop={6}
                    style={styles.iconBtn}
                  >
                    <Text
                      style={[
                        styles.icon,
                        i === template.exercises.length - 1 && styles.iconDisabled,
                      ]}
                    >
                      ↓
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeExerciseFromTemplate(template.id, i)}
                    hitSlop={6}
                    style={styles.iconBtn}
                  >
                    <Text style={styles.iconRemove}>✕</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.stepperRow}>
                <NumberStepper
                  label="Séries"
                  value={te.sets}
                  min={1}
                  max={12}
                  onChange={(v) => updateTemplateExercise(template.id, i, { sets: v })}
                />
                <NumberStepper
                  label="Reps"
                  value={te.reps}
                  min={1}
                  max={50}
                  onChange={(v) => updateTemplateExercise(template.id, i, { reps: v })}
                />
              </View>

              <View style={styles.stepperRow}>
                <NumberStepper
                  label="Charge"
                  value={te.kg}
                  step={2.5}
                  min={0}
                  max={500}
                  format={(v) => `${prefix}${fmtKg(v)} kg`}
                  onChange={(v) => updateTemplateExercise(template.id, i, { kg: v })}
                />
                <NumberStepper
                  label="Repos"
                  value={te.restSec}
                  step={15}
                  min={15}
                  max={600}
                  format={mmss}
                  onChange={(v) => updateTemplateExercise(template.id, i, { restSec: v })}
                />
              </View>

              <View style={styles.stepperRow}>
                <NumberStepper
                  label={`${scaleLabel(settings.rir)} cible`}
                  value={te.rpeTarget}
                  min={6}
                  max={10}
                  format={(v) => String(scaleValue(v, settings.rir))}
                  onChange={(v) => updateTemplateExercise(template.id, i, { rpeTarget: v })}
                />
                <View style={styles.spacer} />
              </View>
            </View>
          );
        })
      )}

      {template.exercises.length > 0 ? (
        <Pressable onPress={() => setPickerOpen(true)} style={styles.addRow}>
          <Text style={styles.addRowLabel}>+ Ajouter un exercice</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteLabel}>Supprimer la séance</Text>
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Ajouter un exercice</Text>
            {available.length === 0 ? (
              <Text style={styles.sheetEmpty}>
                {exercises.length === 0
                  ? "Vous n'avez pas encore créé d'exercice."
                  : 'Tous vos exercices sont déjà dans cette séance.'}
              </Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {available.map((e) => (
                  <Pressable
                    key={e.id}
                    onPress={() => {
                      addExerciseToTemplate(template.id, e.id);
                      setPickerOpen(false);
                    }}
                    style={styles.pickRow}
                  >
                    <View style={styles.pickText}>
                      <Text style={styles.pickName}>{e.name}</Text>
                      <Text style={styles.pickGroup}>{e.group}</Text>
                    </View>
                    <Text style={[styles.pickPlus, { color: accent }]}>+</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gone: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  nameInput: {
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.text,
    paddingVertical: 4,
  },
  summary: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardName: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  cardActions: { flexDirection: 'row', gap: 2 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16, color: colors.textSecondary },
  iconDisabled: { color: '#DDD8D1' },
  iconRemove: { fontSize: 15, color: colors.textFaintest },
  stepperRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  spacer: { flex: 1 },
  addRow: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addRowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textFaint },
  deleteBtn: { alignItems: 'center', paddingVertical: 24 },
  deleteLabel: { fontFamily: fonts.medium, fontSize: 14, color: '#C0392B' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 34,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: 14,
  },
  sheetEmpty: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textFaint, paddingVertical: 12 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.fillPill,
  },
  pickText: { flex: 1 },
  pickName: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.text },
  pickGroup: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  pickPlus: { fontFamily: fonts.semibold, fontSize: 22 },
});
