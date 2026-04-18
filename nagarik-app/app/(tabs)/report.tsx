import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { analyzeReport } from '@/lib/ml';
import { useSession } from '@/hooks/useSession';

const CATEGORIES = ['pothole', 'road_decay', 'garbage', 'waterlogging', 'other'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  pothole: '🕳️ Pothole',
  road_decay: '🛤️ Road Decay',
  garbage: '🗑️ Garbage',
  waterlogging: '🌊 Waterlogging',
  other: '📌 Other',
};

export default function ReportScreen() {
  const { user } = useSession();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationReady(true);
      } else {
        setLocationDenied(true);
      }
    })();
  }, []);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setImageUri(null);
    setDescription('');
    setCategory(null);
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert('Missing image', 'Please take or select a photo first.');
      return;
    }
    if (!category) {
      Alert.alert('Missing category', 'Please select an issue category.');
      return;
    }
    if (!locationReady) {
      Alert.alert('Location unavailable', 'Location permission is required to submit a report.');
      return;
    }
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to submit reports.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Get current location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;

      // 2. Upload image to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${user.id}_${timestamp}.jpg`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        setSubmitting(false);
        return;
      }

      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      const imageUrl = urlData.publicUrl;

      // 4. Send to ML service for analysis
      const mlResult = await analyzeReport({
        image_url: imageUrl,
        description,
        category,
        latitude,
        longitude,
      });

      // 5. Handle result
      if (mlResult.accepted) {
        const { error: insertError } = await supabase.from('reports').insert({
          user_id: user.id,
          image_url: imageUrl,
          description: description || null,
          category,
          latitude,
          longitude,
          status: 'verified',
          severity: mlResult.severity,
        });

        if (insertError) {
          Alert.alert('Database error', insertError.message);
        } else {
          Alert.alert('✅ Success', 'Report submitted successfully!', [
            { text: 'OK', onPress: resetForm },
          ]);
        }
      } else {
        // Rejected — clean up uploaded image
        await supabase.storage.from('report-images').remove([fileName]);
        Alert.alert('❌ Report rejected', mlResult.reason || 'The ML service rejected your report.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header accent */}
      <View style={styles.accent} />

      {/* ─── IMAGE SECTION ─── */}
      <Text style={styles.sectionTitle}>📷 Photo Evidence</Text>
      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageBtn} onPress={pickFromCamera} activeOpacity={0.8}>
          <Text style={styles.imageBtnText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageBtnOutline} onPress={pickFromGallery} activeOpacity={0.8}>
          <Text style={styles.imageBtnOutlineText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>
      {imageUri && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── DESCRIPTION ─── */}
      <Text style={styles.sectionTitle}>📝 Description</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Describe the issue (optional)"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        maxLength={200}
        multiline
        numberOfLines={3}
      />
      <Text style={styles.charCount}>{description.length}/200</Text>

      {/* ─── CATEGORY ─── */}
      <Text style={styles.sectionTitle}>🏷️ Category</Text>
      <View style={styles.pillRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, category === cat && styles.pillActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.pillText, category === cat && styles.pillTextActive]}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── LOCATION ─── */}
      <Text style={styles.sectionTitle}>📍 Location</Text>
      {locationDenied ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ Location permission required to submit</Text>
        </View>
      ) : (
        <Text style={styles.locationHint}>
          {locationReady ? '✅ Location will be captured on submit' : '⏳ Acquiring location...'}
        </Text>
      )}

      {/* ─── SUBMIT ─── */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <View style={styles.submitLoading}>
            <ActivityIndicator color="#1a1a1a" size="small" />
            <Text style={styles.submitLoadingText}>Analysing your report...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  accent: {
    height: 4,
    backgroundColor: '#FF9933',
    borderRadius: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  imageBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  imageBtnOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  imageBtnOutlineText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '700',
  },
  previewWrap: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1a1a1a',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pillActive: {
    borderColor: '#FF9933',
    backgroundColor: '#FFF3E0',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  pillTextActive: {
    color: '#E65100',
    fontWeight: '700',
  },
  locationHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9933',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  warningText: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#FF9933',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitLoadingText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
  },
});
