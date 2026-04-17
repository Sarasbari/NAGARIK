import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';

export default function ReportIncidentScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [gpsReady, setGpsReady] = useState(false);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(camStatus === 'granted');

      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        setGpsReady(true);
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    navigation.navigate('IssueType', {
      photo: photo.uri,
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required</Text>
        <TouchableOpacity
          style={styles.permButton}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={CameraType.back}>
        {/* GPS Indicator */}
        <View style={styles.gpsIndicator}>
          <View
            style={[styles.gpsDot, { backgroundColor: gpsReady ? '#00ff88' : '#ff4444' }]}
          />
          <Text style={styles.gpsText}>
            {gpsReady ? 'GPS Ready' : 'Acquiring GPS...'}
          </Text>
        </View>

        {/* Capture Button */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.7}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 24,
  },
  permissionText: { color: '#fff', fontSize: 18, marginBottom: 16 },
  permButton: {
    backgroundColor: '#FF9933',
    padding: 16,
    borderRadius: 12,
  },
  permButtonText: { fontWeight: '700', fontSize: 16 },
  gpsIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gpsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  gpsText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF9933',
  },
});
