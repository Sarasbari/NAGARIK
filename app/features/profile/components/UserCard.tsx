import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserCardProps {
  name: string;
  phone: string;
  ward?: string;
  totalReports?: number;
}

export default function UserCard({ name, phone, ward, totalReports = 0 }: UserCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{phone}</Text>
        {ward && <Text style={styles.detail}>Ward {ward}</Text>}
        <Text style={styles.detail}>{totalReports} reports submitted</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detail: {
    fontSize: 12,
    color: '#999',
  },
});
