import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import StatusBadge from '../../../components/feedback/StatusBadge';

interface Issue {
  id: string;
  type: string;
  status: string;
  photoUrl?: string;
  createdAt: string;
  ward?: string;
}

interface ReportCardProps {
  issue: Issue;
  onPress: () => void;
}

export default function ReportCard({ issue, onPress }: ReportCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {issue.photoUrl && (
        <Image source={{ uri: issue.photoUrl }} style={styles.thumbnail} />
      )}
      <View style={styles.content}>
        <Text style={styles.type}>{issue.type}</Text>
        <Text style={styles.meta}>
          {issue.ward ? `Ward ${issue.ward} · ` : ''}
          {new Date(issue.createdAt).toLocaleDateString()}
        </Text>
        <StatusBadge status={issue.status as any} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  thumbnail: {
    width: 90,
    height: 90,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  type: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
});
