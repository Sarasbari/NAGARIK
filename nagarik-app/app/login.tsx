import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export default function LoginScreen() {
  const router = useRouter();
  const { session } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)/report');
    }
  }, [session]);

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return false;
    }
    return true;
  };

  const signInWithEmail = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else if (data.session) {
      // Direct routing backup, though useEffect should catch it too
      router.replace('/(tabs)/report');
    }
    setLoading(false);
  };

  const signUpWithEmail = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else if (data.session == null) {
      Alert.alert(
        'Email Verification Required',
        'Please check your inbox. To allow instant login, turn off "Confirm Email" in your Supabase Auth settings.'
      );
    } else {
      router.replace('/(tabs)/report');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={signInWithEmail}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryText}>
            {loading ? 'Logging in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={signUpWithEmail}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
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
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  bottom: {
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  secondaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
});
