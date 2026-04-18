import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function Preferences() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Preferences</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Push Notifications</Text>
        <Switch
          value={pushNotifications}
          onValueChange={setPushNotifications}
          trackColor={{ true: '#FF9933', false: '#ddd' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Location Tracking</Text>
        <Switch
          value={locationTracking}
          onValueChange={setLocationTracking}
          trackColor={{ true: '#FF9933', false: '#ddd' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
