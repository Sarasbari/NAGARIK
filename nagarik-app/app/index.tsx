import { Redirect } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/report" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5',
  },
});
