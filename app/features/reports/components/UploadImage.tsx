import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface UploadImageProps {
  imageUri?: string;
  onPress: () => void;
}

export default function UploadImage({ imageUri, onPress }: UploadImageProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.label}>Tap to capture photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
});
