import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

interface Report {
  id: string;
  image_url: string;
  description: string | null;
  category: string;
  status: string;
  severity: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: '#E0E0E0', text: '#555', label: 'Submitted' },
  verified: { bg: '#C8E6C9', text: '#2E7D32', label: 'Verified' },
  rejected: { bg: '#FFCDD2', text: '#C62828', label: 'Rejected' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SeverityDots({ severity }: { severity: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < severity ? '#FF9933' : '#ddd' },
          ]}
        />
      ))}
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoaded(true);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Report }) => {
    const statusInfo = STATUS_COLORS[item.status] || STATUS_COLORS.submitted;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image_url }} style={styles.thumb} />
        <View style={styles.cardBody}>
          <Text style={styles.category}>
            {item.category.replace('_', ' ').toUpperCase()}
          </Text>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {item.description.substring(0, 60)}
              {item.description.length > 60 ? '...' : ''}
            </Text>
          ) : null}
          <View style={styles.cardMeta}>
            <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
          {item.status === 'verified' && item.severity != null && (
            <SeverityDots severity={item.severity} />
          )}
        </View>
      </View>
    );
  };

  if (loaded && reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>No reports yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the Report tab to get started.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF9933']}
          tintColor="#FF9933"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 14,
  },
  thumb: {
    width: 90,
    height: '100%',
    minHeight: 100,
    resizeMode: 'cover',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
