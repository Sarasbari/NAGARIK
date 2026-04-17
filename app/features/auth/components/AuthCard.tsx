import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  onAction,
  actionLabel,
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.content}>{children}</View>
      {onAction && actionLabel && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#1a1a1a',
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  actionText: {
    color: '#FF9933',
    fontSize: 16,
    fontWeight: '700',
  },
});
