import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StatusBadge from '../components/StatusBadge';

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: '📤' },
  { key: 'ai_reviewed', label: 'AI Classified', icon: '🤖' },
  { key: 'assigned', label: 'Assigned to Dept', icon: '🏢' },
  { key: 'dispatched', label: 'Crew Dispatched', icon: '🚛' },
  { key: 'in_progress', label: 'In Progress', icon: '🔧' },
  { key: 'resolved', label: 'Resolved', icon: '✅' },
];

function getStepIndex(status: string): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function TrackingScreen({ route }: any) {
  const { id, report } = route.params ?? {};
  const currentStep = getStepIndex(report?.status || 'submitted');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Issue #{id ? id.slice(0, 8) : '---'}</Text>

      {report?.issue_type && (
        <Text style={styles.issueType}>
          {report.issue_type} · Severity {report.severity}/5
        </Text>
      )}

      <StatusBadge status={report?.status || 'submitted'} />

      <View style={styles.timeline}>
        {TIMELINE_STEPS.map((step, i) => {
          const isComplete = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <View key={step.key} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    isComplete && styles.dotComplete,
                    isCurrent && styles.dotCurrent,
                  ]}
                >
                  <Text style={styles.dotIcon}>{step.icon}</Text>
                </View>
                {i < TIMELINE_STEPS.length - 1 && (
                  <View
                    style={[styles.line, isComplete && styles.lineComplete]}
                  />
                )}
              </View>
              <View style={styles.timelineRight}>
                <Text
                  style={[styles.stepLabel, isComplete && styles.stepLabelComplete]}
                >
                  {step.label}
                </Text>
                {isCurrent && (
                  <Text style={styles.currentTag}>← Current</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  issueType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  timeline: {
    marginTop: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 48,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotComplete: {
    borderColor: '#1a1a1a',
    backgroundColor: '#FF9933',
  },
  dotCurrent: {
    borderColor: '#FF9933',
    backgroundColor: '#1a1a1a',
  },
  dotIcon: { fontSize: 16 },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: '#ddd',
    minHeight: 20,
  },
  lineComplete: {
    backgroundColor: '#1a1a1a',
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  stepLabelComplete: {
    color: '#1a1a1a',
  },
  currentTag: {
    fontSize: 12,
    color: '#FF9933',
    fontWeight: '700',
  },
});
