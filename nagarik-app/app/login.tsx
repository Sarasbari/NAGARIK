import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/report');
    }
  }, [session]);

  const handleGoogleSignIn = async () => {
    try {
      const redirectTo = makeRedirectUri({ scheme: 'nagarik' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert('Sign In Error', error.message);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(
            url.hash ? url.hash.substring(1) : url.search.substring(1)
          );
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessionError) {
              Alert.alert('Session Error', sessionError.message);
            }
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        {/* Tricolor accent bar */}
        <View style={styles.tricolor}>
          <View style={[styles.stripe, { backgroundColor: '#FF9933' }]} />
          <View style={[styles.stripe, { backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.stripe, { backgroundColor: '#138808' }]} />
        </View>

        <Text style={styles.logo}>🏛️ NAGARIK</Text>
        <Text style={styles.tagline}>
          Your city. Your voice.{'\n'}Report civic issues instantly.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
  },
  tricolor: {
    flexDirection: 'row',
    width: 120,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  stripe: {
    flex: 1,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 28,
  },
  bottom: {
    alignItems: 'center',
    gap: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  googleIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF9933',
  },
  googleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
