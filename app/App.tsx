import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import AppNavigator from './core/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono: SpaceMono_400Regular,
    SpaceMonoBold: SpaceMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C8FF00" />
        <Text style={styles.loadingText}>INITIALIZING NAGRIK...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#C8FF00',
    marginTop: 16,
    fontSize: 14,
    letterSpacing: 3,
  },
});
