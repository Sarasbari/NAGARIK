import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export default function StatusCard({ title, value, icon, color = '#FF9933' }: StatusCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    borderLeftWidth: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  title: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
