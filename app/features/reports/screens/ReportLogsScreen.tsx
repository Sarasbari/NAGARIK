import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ISSUE_TYPES } from '../../../core/constants';

export default function ReportLogsScreen({ route, navigation }: any) {
  const { photo, latitude, longitude } = route.params;
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    // TODO: Submit to AI pipeline + Supabase
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's the issue?</Text>

      {photo && (
        <Image source={{ uri: photo }} style={styles.preview} />
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {ISSUE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selected === type.id && { borderColor: type.color, backgroundColor: type.color + '20' },
            ]}
            onPress={() => setSelected(type.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, !selected && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!selected}
      >
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    marginBottom: 20,
  },
  list: { flex: 1 },
  listContent: { gap: 10 },
  typeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  submitButton: {
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#FF9933',
    fontSize: 18,
    fontWeight: '800',
  },
});
