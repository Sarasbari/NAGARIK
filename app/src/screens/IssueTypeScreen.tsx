import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useReportStore } from '../store/reportStore';

const ISSUE_TYPES = [
  { id: 'pothole', label: '🕳️ Pothole', color: '#FF6B6B' },
  { id: 'garbage', label: '🗑️ Garbage Dump', color: '#51CF66' },
  { id: 'drainage', label: '💧 Drainage/Sewage', color: '#339AF0' },
  { id: 'streetlight', label: '💡 Streetlight', color: '#FCC419' },
  { id: 'encroachment', label: '🚧 Encroachment', color: '#FF922B' },
  { id: 'water', label: '🚰 Water Supply', color: '#22B8CF' },
  { id: 'road', label: '🛣️ Road Damage', color: '#845EF7' },
  { id: 'other', label: '📋 Other', color: '#868E96' },
];

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export default function IssueTypeScreen({ route, navigation }: any) {
  const { photo, latitude, longitude } = route.params;
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const addReport = useReportStore((s) => s.addReport);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);

    try {
      // Build FormData with the captured photo
      const formData = new FormData();
      formData.append('image', {
        uri: photo,
        type: 'image/jpeg',
        name: `report_${Date.now()}.jpg`,
      } as any);

      // citizen_id is optional for hackathon
      // formData.append('citizen_id', userId);

      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.status === 422 || !data.accepted) {
        // ML rejected the image
        const reason = data.reason || 'Image was not accepted';
        const friendlyReasons: Record<string, string> = {
          no_gps_in_image: 'No GPS data found in the photo. Please enable location services and try again.',
          fake_or_edited_image: 'The image appears to be edited or AI-generated. Please take a real photo.',
          not_road: 'This doesn\'t appear to be a road infrastructure issue.',
          low_confidence: 'The AI could not clearly identify the issue. Please take a clearer photo.',
        };
        Alert.alert(
          '❌ Report Rejected',
          friendlyReasons[reason] || reason,
          [{ text: 'Try Again', onPress: () => navigation.goBack() }]
        );
        return;
      }

      if (data.accepted && data.report) {
        // Add to local store
        addReport({
          id: data.report.id,
          type: data.report.issue_type,
          status: data.report.status,
          photoUrl: data.report.photo_url,
          latitude: data.report.latitude,
          longitude: data.report.longitude,
          severity: data.report.severity,
          createdAt: data.report.created_at,
        });

        Alert.alert(
          '✅ Report Submitted!',
          `Issue classified as "${data.report.issue_type}" with severity ${data.report.severity}/5.`,
          [
            {
              text: 'View Status',
              onPress: () => navigation.navigate('Tracking', { id: data.report.id, report: data.report }),
            },
            {
              text: 'Go Home',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('[Submit Error]', err);
      Alert.alert(
        '⚠️ Submission Failed',
        'Could not connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
          >
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, (!selected || submitting) && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!selected || submitting}
      >
        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FF9933" />
            <Text style={styles.submitText}> Analyzing & Uploading...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
