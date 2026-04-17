import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Status = 'submitted' | 'classified' | 'assigned' | 'dispatched' | 'in_progress' | 'resolved';

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  submitted: { label: 'Submitted', bg: '#E3F2FD', color: '#1565C0' },
  classified: { label: 'AI Classified', bg: '#F3E5F5', color: '#7B1FA2' },
  assigned: { label: 'Assigned', bg: '#FFF3E0', color: '#E65100' },
  dispatched: { label: 'Dispatched', bg: '#E8F5E9', color: '#2E7D32' },
  in_progress: { label: 'In Progress', bg: '#FFF8E1', color: '#F57F17' },
  resolved: { label: 'Resolved', bg: '#E0F2F1', color: '#00695C' },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
