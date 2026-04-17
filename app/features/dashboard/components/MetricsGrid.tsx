import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusCard from './StatusCard';

interface MetricsGridProps {
  totalReports?: number;
  resolvedReports?: number;
  pendingReports?: number;
  avgResolutionTime?: string;
}

export default function MetricsGrid({
  totalReports = 0,
  resolvedReports = 0,
  pendingReports = 0,
  avgResolutionTime = '--',
}: MetricsGridProps) {
  return (
    <View style={styles.grid}>
      <StatusCard title="Total Reports" value={totalReports} icon="📊" color="#339AF0" />
      <StatusCard title="Resolved" value={resolvedReports} icon="✅" color="#51CF66" />
      <StatusCard title="Pending" value={pendingReports} icon="⏳" color="#FCC419" />
      <StatusCard title="Avg Resolution" value={avgResolutionTime} icon="⚡" color="#FF6B6B" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
});
