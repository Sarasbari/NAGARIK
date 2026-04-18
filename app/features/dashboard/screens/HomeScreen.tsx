import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ReportCard from '../../reports/components/ReportCard';
import { useReportStore } from '../../../store/slices/reportStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export default function HomeScreen({ navigation }: any) {
  const reports = useReportStore((s) => s.reports);
  const setReports = useReportStore((s) => s.setReports);
  const isLoading = useReportStore((s) => s.isLoading);
  const setLoading = useReportStore((s) => s.setLoading);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      const data = await response.json();

      if (data.reports && Array.isArray(data.reports)) {
        setReports(
          data.reports.map((r: any) => ({
            id: r.id,
            type: r.issue_type,
            status: r.status,
            photoUrl: r.photo_url,
            latitude: r.latitude,
            longitude: r.longitude,
            severity: r.severity,
            ward: r.ward,
            createdAt: r.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('[Fetch Reports Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Refetch when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchReports);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Nagarik</Text>
        <Text style={styles.greeting}>Your city, your voice 🏙️</Text>
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('Camera')}
        activeOpacity={0.85}
      >
        <Text style={styles.reportButtonText}>📸 Report Issue</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Reports</Text>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading reports...' : 'No reports yet.'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isLoading ? '' : 'Tap "Report Issue" to get started.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReportCard
                issue={item}
                onPress={() => navigation.navigate('Tracking', { id: item.id, report: item })}
              />
            )}
            contentContainerStyle={{ gap: 12 }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={fetchReports} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  reportButton: {
    backgroundColor: '#FF9933',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    marginBottom: 32,
  },
  reportButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
});
