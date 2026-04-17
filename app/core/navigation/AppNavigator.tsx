import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NagrikCommandApp from '../../features/brutalist/screens/NagrikCommandApp';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import HomeScreen from '../../features/dashboard/screens/HomeScreen';
import ReportIncidentScreen from '../../features/reports/screens/ReportIncidentScreen';
import ReportLogsScreen from '../../features/reports/screens/ReportLogsScreen';
import TrackingScreen from '../../features/reports/screens/TrackingScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="NagrikApp"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* ━━━ BRUTALIST COMMAND UI (new default) ━━━ */}
        <Stack.Screen name="NagrikApp" component={NagrikCommandApp} />

        {/* ━━━ Original screens (preserved) ━━━ */}
        <Stack.Screen name="Splash" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={ReportIncidentScreen} />
        <Stack.Screen name="IssueType" component={ReportLogsScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
