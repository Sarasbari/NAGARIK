import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: Integrate with react-native-maps for actual map rendering

export default function IncidentMap() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Incident Map</Text>
        <Text style={styles.subtitle}>Map visualization coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    minHeight: 200,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
