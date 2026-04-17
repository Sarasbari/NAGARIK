import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import UserCard from '../components/UserCard';
import Preferences from '../components/Preferences';

export default function ProfileScreen({ navigation }: any) {
  // TODO: Pull user data from auth store
  const mockUser = {
    name: 'Citizen',
    phone: '+91 98765 43210',
    ward: '12',
    totalReports: 5,
  };

  const handleSignOut = () => {
    // TODO: Call authStore.signOut() and navigate to Splash
    navigation.replace('Splash');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <UserCard
        name={mockUser.name}
        phone={mockUser.phone}
        ward={mockUser.ward}
        totalReports={mockUser.totalReports}
      />

      <Preferences />

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  signOutText: {
    color: '#FF9933',
    fontSize: 18,
    fontWeight: '800',
  },
});
