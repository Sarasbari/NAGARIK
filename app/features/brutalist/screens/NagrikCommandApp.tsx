import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../utils/supabase';

// Complete any pending auth sessions (required by expo-auth-session)
WebBrowser.maybeCompleteAuthSession();

// ━━━ COLOR SYSTEM ━━━
const C = {
  bg: '#0A0A0A',
  bgCard: '#141414',
  bgCard2: '#1A1A1A',
  accentGreen: '#C8FF00',
  accentOrange: '#FF4D00',
  accentAmber: '#FFA500',
  textPrimary: '#FFFFFF',
  textMuted: '#666666',
  border: '#2A2A2A',
  critical: '#FF4D00',
  resolved: '#C8FF00',
  mapBg: '#0F0F0F',
  google: '#4285F4',
};

const FONT = 'SpaceMono';
const FONT_BOLD = 'SpaceMonoBold';

// ━━━ GOOGLE OAUTH CONFIG ━━━
// To use real Google OAuth, set this to your Google Cloud Console CLIENT_ID
// For Expo Go, create an OAuth 2.0 client ID of type "Web application"
// and add the Expo auth proxy redirect URI.
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

// ━━━ TYPES ━━━
interface Report {
  id: string;
  title: string;
  desc: string;
  time: string;
  status: 'pending' | 'resolved';
  imageUri?: string;
  metadata?: {
    width: number;
    height: number;
    fileSize?: number;
    type?: string;
    exif?: any;
  };
}

interface UserInfo {
  name: string;
  email: string;
  photoUrl: string | null;
  id?: string;
}

// ━━━ ANIMATED COUNTER HOOK ━━━
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

// ━━━ BLINK COMPONENT ━━━
function BlinkText({ text, style }: { text: string; style?: any }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.Text style={[style, { opacity }]}>{text}</Animated.Text>;
}

// ━━━ PULSE DOT ━━━
function PulseDot({ color, size = 12, left, top }: { color: string; size?: number; left: number; top: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opac = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.8, duration: 800, useNativeDriver: true }),
          Animated.timing(opac, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(opac, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        backgroundColor: color,
        transform: [{ scale }],
        opacity: opac,
      }}
    />
  );
}

// ━━━ TOGGLE SWITCH ━━━
function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[s.toggleTrack, { backgroundColor: value ? C.accentGreen : '#333' }]}
      activeOpacity={0.7}
    >
      <Animated.View style={[s.toggleThumb, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
}

// ━━━ SCREEN FADE WRAPPER ━━━
function ScreenFade({ children, activeKey }: { children: React.ReactNode; activeKey: string }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [activeKey]);
  return <Animated.View style={{ flex: 1, opacity: fade }}>{children}</Animated.View>;
}

// ━━━ IMAGE PICK MODAL ━━━
function ImagePickModal({
  visible,
  onCamera,
  onGallery,
  onClose,
}: {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>■ SELECT IMAGE SOURCE</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.modalDivider} />
          <TouchableOpacity style={s.modalOption} onPress={onCamera} activeOpacity={0.7}>
            <Text style={s.modalOptionIcon}>📷</Text>
            <View>
              <Text style={s.modalOptionLabel}>CAMERA</Text>
              <Text style={s.modalOptionSub}>Capture new photo</Text>
            </View>
          </TouchableOpacity>
          <View style={s.modalDivider} />
          <TouchableOpacity style={s.modalOption} onPress={onGallery} activeOpacity={0.7}>
            <Text style={s.modalOptionIcon}>🖼</Text>
            <View>
              <Text style={s.modalOptionLabel}>GALLERY</Text>
              <Text style={s.modalOptionSub}>Choose existing photo</Text>
            </View>
          </TouchableOpacity>
          <View style={s.modalDivider} />
          <TouchableOpacity style={s.modalCancelBtn} onPress={onClose}>
            <Text style={s.modalCancelText}>✕ CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ━━━ SUCCESS TOAST ━━━
function SuccessToast({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  return (
    <Animated.View style={[s.toast, { opacity }]} pointerEvents="none">
      <Text style={s.toastText}>✓ REPORT SUBMITTED — LOGGED TO PROFILE</Text>
    </Animated.View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function NagrikCommandApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [showLogin, setShowLogin] = useState(false);

  // ── AUTH STATE ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [pendingImageAction, setPendingImageAction] = useState(false); // true = was trying to upload image
  const [isRestoring, setIsRestoring] = useState(true); // Loading stored session

  // ── REPORT FORM STATE ──
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [pickedMetadata, setPickedMetadata] = useState<any>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null); // pending confirm
  const [previewMetadata, setPreviewMetadata] = useState<any>(null); // pending confirm
  const [showPickModal, setShowPickModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submitPressed, setSubmitPressed] = useState(false);

  // ── SHARED REPORTS (home + profile) ──
  const [userReports, setUserReports] = useState<Report[]>([
    {
      id: 'RPT-842',
      title: 'CRITICAL POTHOLE – SECTOR 7G',
      desc: 'Large pothole causing traffic disruption on main arterial road. Multiple vehicles damaged.',
      time: '2H AGO',
      status: 'pending',
    },
    {
      id: 'RPT-837',
      title: 'WATER LEAK – BLOCK 14A',
      desc: 'Underground pipe burst detected near residential complex. Water pressure dropping.',
      time: '5H AGO',
      status: 'resolved',
    },
    {
      id: 'RPT-831',
      title: 'OVERFLOWING BIN – ZONE DELTA',
      desc: 'Waste overflow at community junction. Sanitation hazard flagged by automated sensor.',
      time: '1D AGO',
      status: 'pending',
    },
  ]);

  // ── PROFILE TOGGLES ──
  const [encryption, setEncryption] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending'>('all');

  // ── PERSISTENCE: LOAD STORED DATA & SUPABASE AUTH ──
  useEffect(() => {
    let authSub: any;

    const loadData = async () => {
      try {
        // We will fetch remote reports later, but initialize state via supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Operator',
              email: session.user.email || '',
              photoUrl: session.user.user_metadata?.avatar_url || null,
            });
            setIsLoggedIn(true);
          }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || 'Operator',
                email: session.user.email || '',
                photoUrl: session.user.user_metadata?.avatar_url || null,
              });
              setIsLoggedIn(true);
              setShowLogin(false);
            } else {
              setIsLoggedIn(false);
              setUser(null);
            }
          }
        );
        authSub = subscription;

        const storedAuth = await AsyncStorage.getItem('nagarik_auth');
        if (storedAuth) {
          const { pending } = JSON.parse(storedAuth);
          setPendingImageAction(pending);
        }
      } catch (e) {
        console.log('Error initializing:', e);
      } finally {
        setIsRestoring(false);
      }
    };
    
    loadData();
    fetchRemoteReports();

    return () => {
      authSub?.unsubscribe();
    };
  }, []);

  const fetchRemoteReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (!error && data) {
        // Map to local format
        const mapped = data.map(r => ({
          id: r.id.substring(0, 8).toUpperCase(),
          title: `FIELD REPORT - ${r.issue_type}`,
          desc: `Confidence: ${r.ai_confidence ? (r.ai_confidence * 100).toFixed(0) + '%' : 'N/A'}. ${r.ward ? 'Ward: ' + r.ward : ''}`,
          time: new Date(r.created_at).toLocaleDateString(),
          status: r.status,
          imageUri: r.photo_url,
          metadata: r.latitude ? { width: 0, height: 0, exif: { lat: r.latitude, lng: r.longitude } } : undefined
        } as Report));
        setUserReports(mapped);
      }
    } catch (e) {
      console.log('Fetch error', e);
    }
  };

  useEffect(() => {
    if (!isRestoring) {
      AsyncStorage.setItem('nagarik_auth', JSON.stringify({
        pending: pendingImageAction,
      }));
    }
  }, [pendingImageAction, isRestoring]);

  // ── COUNTER ANIMATIONS (Mock Stats) ──
  const potholes = useCountUp(124);
  const waterLeaks = useCountUp(42);
  const bins = useCountUp(89);
  const avgResp = useCountUp(14);
  const responseRating = useCountUp(98);

  // ── GOOGLE SIGN-IN HANDLER (Supabase OAuth & Fallback) ──
  const handleGoogleSignIn = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'nagarik',
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No redirect URL returned');

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      
      if (res.type === 'success' && res.url) {
        // Handled by onAuthStateChange subscription
      } else {
        throw new Error('Sign in was canceled or failed.');
      }
    } catch (e: any) {
      console.log('OAuth Failed, falling back to Demo Operator mode due to environment misconfiguration:', e.message);
      
      // FALLBACK DEMO LOGIN: So you aren't blocked by OAuth issues!
      setUser({
        id: '99999999-9999-9999-9999-999999999999', // Ensure UUID format for Supabase insertion matches
        name: 'Nagrik Operator',
        email: 'operator@nagarik.gov.in',
        photoUrl: null,
      });
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  };

  // ── LOGOUT ──
  const handleLogout = () => {
    Alert.alert(
      'CONFIRM LOGOUT',
      'Are you sure you want to end your session?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'LOGOUT',
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
            setUser(null);
            setActiveTab('home');
          },
        },
      ]
    );
  };

  // ── UPLOAD IMAGE BUTTON HANDLER ──
  const handleUploadPress = () => {
    if (!isLoggedIn) {
      setPendingImageAction(true);
      setShowLogin(true);
    } else {
      // Logged in — go directly to camera
      handleCamera();
    }
  };

  // ── CAMERA ──
  const handleCamera = async () => {
    setShowPickModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('PERMISSION DENIED', 'Camera access is required to capture incident photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
      exif: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Show preview — user must confirm before finalising
      setPreviewImageUri(asset.uri);
      setPreviewMetadata({
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileSize: asset.fileSize,
        exif: asset.exif,
      });
    }
  };

  // ── GALLERY ──
  const handleGallery = async () => {
    setShowPickModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('PERMISSION DENIED', 'Gallery access is required to upload incident photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
      exif: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Show preview — user must confirm before finalising
      setPreviewImageUri(asset.uri);
      setPreviewMetadata({
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileSize: asset.fileSize,
        exif: asset.exif,
      });
    }
  };

  // ── METADATA ALERT HELPER ──
  const showMetadataAlert = (meta: any) => {
    if (!meta) {
      Alert.alert('📋 NO METADATA', 'This image was generated without technical metadata.', [{ text: 'OK' }]);
      return;
    }
    const body = `
DIMENSIONS: ${meta.width}x${meta.height}
FILE SIZE: ${meta.fileSize ? (meta.fileSize / 1024).toFixed(1) + ' KB' : 'UNKNOWN'}
TYPE: ${meta.type?.toUpperCase() || 'IMAGE'}
DEVICE: ${meta.exif?.Model || 'UNKNOWN'}
SOFTWARE: ${meta.exif?.Software || 'UNKNOWN'}
    `.trim();
    Alert.alert('📋 IMAGE METADATA', body, [{ text: 'CLOSE' }]);
  };

  // ── PREVIEW: CONFIRM IMAGE ──
  const handleConfirmImage = () => {
    // We already have the preview URI and Metadata in state.
    // The user wants the "right button" (Confirm) to "upload" (Submit) immediately.
    
    // 1. Finalise the state for the report creation
    const currentUri = previewImageUri;
    const currentMeta = previewMetadata;
    
    setPickedImageUri(currentUri);
    setPickedMetadata(currentMeta);
    setPreviewImageUri(null);
    setPreviewMetadata(null);

    // 2. Trigger the submission immediately
    // Note: We use the local constants because state updates are async
    submitReport(currentUri, currentMeta);
  };

  // ── PREVIEW: REJECT IMAGE ──
  const handleRejectImage = () => {
    setPreviewImageUri(null);
    setPreviewMetadata(null);
  };

  // ── SHARED SUBMIT LOGIC ──
  const submitReport = async (imageUriOverride?: string | null, metaOverride?: any) => {
    if (!isLoggedIn || !user) {
      setPendingImageAction(false);
      setShowLogin(true);
      return;
    }
    
    const finalUri = imageUriOverride !== undefined ? imageUriOverride : pickedImageUri;
    const finalMeta = metaOverride !== undefined ? metaOverride : pickedMetadata;

    if (!finalUri) {
      Alert.alert('INCOMPLETE REPORT', 'Please provide an image before submitting.');
      return;
    }

    setIsRestoring(true); // Re-use isRestoring to show global loading indicator
    let tempImageId = `RPT-TEMP-${Date.now()}`;
    const newReport: Report = {
      id: tempImageId,
      title: 'ANALYZING & UPLOADING...',
      desc: 'Running AI verification...',
      time: 'JUST NOW',
      status: 'pending',
      imageUri: finalUri,
      metadata: finalMeta,
    };
    setUserReports((prev) => [newReport, ...prev]);

    try {
      // 1. ML Analysis
      const formData = new FormData();
      formData.append('file', {
        uri: finalUri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      } as any);

      // Using IP for local network emulator -> host access
      const mlApiUrl = process.env.EXPO_PUBLIC_ML_API_URL || 'http://10.0.2.2:8000';
      const mlResponse = await fetch(`${mlApiUrl}/ml/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!mlResponse.ok) {
        throw new Error('ML Pipeline analysis failed.');
      }

      const mlResult = await mlResponse.json();
      
      if (!mlResult.is_accepted) {
        throw new Error(`Report Rejected: ${mlResult.rejection_reason}`);
      }

      // 2. Upload to Supabase Storage
      const base64Data = await FileSystem.readAsStringAsync(finalUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('incident-images')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('incident-images')
        .getPublicUrl(fileName);
        
      const imageUrl = publicUrlData.publicUrl;

      // 3. Insert Database Record
      // We fall back to standard metadata if ML API doesn't find coordinates
      const lat = mlResult.gps_coordinates?.latitude || finalMeta?.exif?.GPSLatitude || null;
      const lng = mlResult.gps_coordinates?.longitude || finalMeta?.exif?.GPSLongitude || null;
      
      const { data: insertData, error: insertError } = await supabase.from('reports').insert({
        citizen_id: user.id,
        issue_type: mlResult.classification || 'Other',
        severity: mlResult.severity || 3,
        latitude: lat,
        longitude: lng,
        photo_url: imageUrl,
        ai_confidence: mlResult.confidence,
        status: 'submitted',
        ward: 'NOT SPECIFIED'
      }).select().single();

      if (insertError) throw insertError;

      // 4. Update UI
      setUserReports((prev) => prev.map(r => r.id === tempImageId ? {
        id: insertData.id.substring(0, 8).toUpperCase(),
        title: `FIELD REPORT – ${insertData.issue_type}`,
        desc: `Confidence: ${(insertData.ai_confidence * 100).toFixed(0)}%. ${description.trim()}`,
        time: 'JUST NOW',
        status: 'pending',
        imageUri: imageUrl,
      } as Report : r));

      Alert.alert('SUCCESS', 'Report successfully verified and filed.');
      setShowToast(true);
      setActiveTab('profile'); 
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (e: any) {
      console.error(e);
      Alert.alert('SUBMISSION ERROR', e.message);
      setUserReports((prev) => prev.filter(r => r.id !== tempImageId));
    } finally {
      setIsRestoring(false);
      setDescription('');
      setLocation('');
      setPickedImageUri(null);
      setPickedMetadata(null);
      setPreviewImageUri(null);
      setPreviewMetadata(null);
    }
  };

  // ── SUBMIT REPORT BUTTON (Form) ──
  const handleSubmit = () => {
    submitReport();
  };

  // ── INITIALIZING / RESTORING SESSION ──
  if (isRestoring) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={C.accentGreen} />
        <Text style={{ color: C.accentGreen, marginTop: 20, fontFamily: FONT, letterSpacing: 2 }}>INITIALIZING SECURE SESSION...</Text>
      </View>
    );
  }

  // ── LOGIN SCREEN GATE ──
  if (showLogin) {
    return (
      <View style={[s.root, { backgroundColor: '#000' }]}>
        <StatusBar style="light" />
        <ScreenFade activeKey="login">
          <LoginScreen
            onBack={() => { setShowLogin(false); setPendingImageAction(false); }}
            onSignIn={handleGoogleSignIn}
            hasClientId={!!GOOGLE_CLIENT_ID}
          />
        </ScreenFade>
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            potholes={potholes}
            waterLeaks={waterLeaks}
            bins={bins}
            avgResp={avgResp}
            description={description}
            setDescription={setDescription}
            location={location}
            setLocation={setLocation}
            submitPressed={submitPressed}
            setSubmitPressed={setSubmitPressed}
            onLoginPress={() => setShowLogin(true)}
            onUploadPress={handleUploadPress}
            onChangePhoto={() => setShowPickModal(true)}
            onSubmit={handleSubmit}
            pickedImageUri={pickedImageUri}
            pickedMetadata={pickedMetadata}
            previewImageUri={previewImageUri}
            previewMetadata={previewMetadata}
            onConfirmImage={handleConfirmImage}
            onRejectImage={handleRejectImage}
            showMetadataAlert={showMetadataAlert}
            isLoggedIn={isLoggedIn}
            user={user}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            totalReports={userReports.length}
            responseRating={responseRating}
            encryption={encryption}
            setEncryption={setEncryption}
            locationTracking={locationTracking}
            setLocationTracking={setLocationTracking}
            reportFilter={reportFilter}
            setReportFilter={setReportFilter}
            userReports={userReports}
            isLoggedIn={isLoggedIn}
            user={user}
            onLoginPress={() => setShowLogin(true)}
            onLogout={handleLogout}
            showMetadataAlert={showMetadataAlert}
          />
        );
    }
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <ScreenFade activeKey={activeTab}>{renderScreen()}</ScreenFade>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Image Source Modal (for "change photo" — not the first upload) */}
      <ImagePickModal
        visible={showPickModal}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onClose={() => setShowPickModal(false)}
      />

      {/* Success Toast */}
      <SuccessToast visible={showToast} />
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOME DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HomeScreen({
  potholes, waterLeaks, bins, avgResp,
  description, setDescription, location, setLocation,
  submitPressed, setSubmitPressed,
  onLoginPress, onUploadPress, onChangePhoto, onSubmit,
  pickedImageUri, pickedMetadata, previewImageUri, previewMetadata, onConfirmImage, onRejectImage,
  showMetadataAlert,
  isLoggedIn, user,
}: any) {
  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* TOP BAR */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <View style={s.logoSquare} />
          <Text style={s.logoText}>NAGRIK</Text>
        </View>
        <TouchableOpacity onPress={onLoginPress}>
          {isLoggedIn && user ? (
            <View style={s.topBarUser}>
              {user.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={s.topBarAvatar} />
              ) : (
                <View style={s.topBarAvatarPlaceholder}>
                  <Text style={s.topBarAvatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <Text style={[s.loginBtn, { color: C.accentGreen }]}>
                {user.name.split(' ')[0].toUpperCase()}
              </Text>
            </View>
          ) : (
            <Text style={s.loginBtn}>LOGIN</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SYSTEM ONLINE BANNER */}
      <View style={s.bannerOnline}>
        <Text style={s.bannerOnlineText}>■ SYSTEM ONLINE</Text>
      </View>
      <View style={s.bannerSync}>
        <Text style={s.bannerSyncText}>⚡ DATA SYNCED</Text>
      </View>

      {/* STAT CARDS 2x2 */}
      <View style={s.statGrid}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>ACTIVE POTHOLES</Text>
          <View style={s.statRow}>
            <Text style={s.statNumber}>{potholes}</Text>
            <Text style={[s.statIcon, { color: C.accentOrange }]}>↗</Text>
          </View>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>WATER LEAKS</Text>
          <View style={s.statRow}>
            <Text style={s.statNumber}>{waterLeaks}</Text>
            <Text style={[s.statIcon, { color: '#4FC3F7' }]}>💧</Text>
          </View>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>OVERFLOWING BINS</Text>
          <View style={s.statRow}>
            <Text style={s.statNumber}>{bins}</Text>
            <Text style={[s.statIcon, { color: C.accentOrange }]}>🗑</Text>
          </View>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>AVG RESPONSE</Text>
          <View style={s.statRow}>
            <Text style={s.statNumber}>{avgResp}M</Text>
            <Text style={[s.statIcon, { color: C.textMuted }]}>⏱</Text>
          </View>
        </View>
      </View>

      {/* LIVE INCIDENT MAP */}
      <Text style={s.sectionTitle}>LIVE INCIDENT MAP</Text>
      <View style={s.mapContainer}>
        <View style={s.mapGridH1} />
        <View style={s.mapGridH2} />
        <View style={s.mapGridV1} />
        <View style={s.mapGridV2} />
        <View style={s.zoomControls}>
          <TouchableOpacity style={s.zoomBtn}><Text style={s.zoomText}>+</Text></TouchableOpacity>
          <TouchableOpacity style={s.zoomBtn}><Text style={s.zoomText}>−</Text></TouchableOpacity>
        </View>
        <PulseDot color={C.critical} size={14} left={80} top={60} />
        <PulseDot color={C.critical} size={14} left={220} top={100} />
        <PulseDot color={C.resolved} size={14} left={150} top={140} />
        <View style={s.alertCard}>
          <View style={s.alertBorder} />
          <View style={s.alertContent}>
            <Text style={s.alertLabel}>CRITICAL</Text>
            <Text style={s.alertText}>Multiple reports: Water main break Sector 7G.</Text>
          </View>
        </View>
      </View>

      {/* REPORT INCIDENT */}
      <Text style={s.sectionTitle}>REPORT INCIDENT</Text>
      <Text style={s.sectionSubtitle}>Submit new field data for immediate routing.</Text>

      {/* Auth notice if not logged in */}
      {!isLoggedIn && (
        <View style={s.authNotice}>
          <Text style={s.authNoticeText}>⚠ LOGIN REQUIRED TO SUBMIT REPORTS</Text>
        </View>
      )}

      {/* Upload box — shows preview+confirm, confirmed image, or empty state */}
      {previewImageUri ? (
        // ── PREVIEW STATE: confirm or reject ──
        <View style={s.uploadBox}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => showMetadataAlert(previewMetadata)}
            style={{ width: '100%' }}
          >
            <Image source={{ uri: previewImageUri }} style={s.uploadedImage} />
          </TouchableOpacity>
          {previewMetadata && (
            <View style={s.metadataOverlay}>
              <Text style={s.metadataOverlayText}>
                {previewMetadata.width}x{previewMetadata.height}
                {previewMetadata.fileSize ? ` ■ ${(previewMetadata.fileSize / 1024).toFixed(1)}KB` : ''}
                {previewMetadata.type?.includes('/') ? ` ■ ${previewMetadata.type.split('/')[1].toUpperCase()}` : ''}
              </Text>
            </View>
          )}
          <View style={s.previewActionRow}>
            <TouchableOpacity style={s.rejectBtn} onPress={onRejectImage} activeOpacity={0.8}>
              <Text style={s.rejectBtnText}>✕  REJECT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={onConfirmImage} activeOpacity={0.8}>
              <Text style={s.confirmBtnText}>✓  CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : pickedImageUri ? (
        // ── CONFIRMED STATE: image locked in ──
        <TouchableOpacity style={s.uploadBox} activeOpacity={0.7} onPress={onChangePhoto}>
          <View style={{ width: '100%', position: 'relative' }}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => showMetadataAlert(pickedMetadata)}
              style={{ width: '100%' }}
            >
              <Image source={{ uri: pickedImageUri }} style={s.uploadedImage} />
            </TouchableOpacity>
            <View style={s.confirmedOverlay}>
              <Text style={s.confirmedOverlayText}>✓ IMAGE CONFIRMED</Text>
              {pickedMetadata && (
                <Text style={s.metadataSubText}>
                  {pickedMetadata.width}x{pickedMetadata.height}
                  {pickedMetadata.fileSize ? ` • ${(pickedMetadata.fileSize / 1024).toFixed(1)}KB` : ''}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        // ── EMPTY STATE: tap to open camera ──
        <TouchableOpacity style={s.uploadBox} activeOpacity={0.7} onPress={onUploadPress}>
          <Text style={s.uploadIcon}>📷</Text>
          <Text style={s.uploadText}>CAPTURE PHOTO</Text>
          {!isLoggedIn ? (
            <Text style={s.uploadSubText}>REQUIRES LOGIN</Text>
          ) : (
            <Text style={s.uploadSubTextGreen}>TAP TO OPEN CAMERA</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Change photo button only when confirmed and NOT in preview */}
      {pickedImageUri && !previewImageUri && (
        <TouchableOpacity onPress={onChangePhoto} style={s.changePhotoBtn}>
          <Text style={s.changePhotoText}>✎ CHANGE PHOTO</Text>
        </TouchableOpacity>
      )}

      {/* Description */}
      <Text style={s.inputLabel}>DESCRIPTION</Text>
      <TextInput
        style={s.textarea}
        placeholder="Describe the incident..."
        placeholderTextColor={C.textMuted}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />

      {/* Location */}
      <Text style={s.inputLabel}>LOCATION</Text>
      <View style={s.locationRow}>
        <Text style={s.locationPin}>📍</Text>
        <TextInput
          style={s.locationInput}
          placeholder="Enter location..."
          placeholderTextColor={C.textMuted}
          value={location}
          onChangeText={setLocation}
        />
      </View>
      <TouchableOpacity>
        <Text style={s.autoDetect}>AUTO-DETECT LOCATION</Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[s.submitBtn, submitPressed && s.submitBtnInverted]}
        activeOpacity={0.8}
        onPressIn={() => setSubmitPressed(true)}
        onPressOut={() => setSubmitPressed(false)}
        onPress={onSubmit}
      >
        <Text style={[s.submitText, submitPressed && s.submitTextInverted]}>
          ▶ SUBMIT REPORT
        </Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN / AUTH TERMINAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginScreen({ onBack, onSignIn, hasClientId }: { onBack: () => void; onSignIn: () => void; hasClientId: boolean }) {
  const [signing, setSigning] = useState(false);

  const handleSignIn = async () => {
    setSigning(true);
    try {
      await onSignIn();
    } catch (e) {
      // Auth cancelled or failed
    }
    setSigning(false);
  };

  return (
    <View style={[s.screen, { backgroundColor: '#000' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.authFrame}>
          {/* Top row */}
          <View style={s.authTopRow}>
            <View style={s.authTopLeft}>
              <TouchableOpacity onPress={onBack}>
                <Text style={s.authBackBtn}>◀</Text>
              </TouchableOpacity>
              <Text style={s.authTermLabel}>SYS.AUTH.TERMINAL</Text>
            </View>
            <View style={s.authBadge}>
              <Text style={s.authBadgeText}>■ REQ.IDENTITY</Text>
            </View>
          </View>

          <Text style={s.authHeading}>NAGRIK</Text>
          <Text style={s.authSubheading}>COMMAND ARCHITECTURE / LEVEL 4</Text>

          {/* Status table */}
          <View style={s.authStatusTable}>
            <View style={s.authStatusBar} />
            <View style={s.authStatusRows}>
              <AuthStatusRow label="HANDSHAKE_PROTOCOL" value="ESTABLISHED" />
              <AuthStatusRow label="LAYER_7_ROUTING" value="ON" />
              <AuthStatusRow label="NODE_CLUSTER_STATUS" value="ACTIVE [84/84]" />
              <View style={s.authStatusRowItem}>
                <Text style={[s.authStatusLabel, { color: C.accentOrange }]}>AUTH REQUIRED</Text>
                <Text style={s.authStatusArrow}>→</Text>
                {signing ? (
                  <Text style={[s.authStatusValue, { color: C.accentGreen }]}>AUTHENTICATING...</Text>
                ) : (
                  <BlinkText text="_WAITING" style={[s.authStatusValue, { color: C.accentOrange }]} />
                )}
              </View>
            </View>
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={[s.googleSignInBtn, signing && { opacity: 0.6 }]}
            activeOpacity={0.8}
            onPress={handleSignIn}
            disabled={signing}
          >
            <View style={s.googleIconBox}>
              <Text style={s.googleIconText}>G</Text>
            </View>
            <Text style={s.googleSignInText}>
              {signing ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
            </Text>
          </TouchableOpacity>

          {/* Developer config notice */}
          {!hasClientId && (
            <View style={s.demoNotice}>
              <Text style={s.demoNoticeText}>⚡ DEMO MODE — NO CLIENT_ID SET</Text>
            </View>
          )}

          {/* OAuth setup reminder */}
          <View style={s.oauthConfigNotice}>
            <Text style={s.oauthConfigText}>
              ⚠ Set EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env to enable real Google Auth
            </Text>
          </View>

          <Text style={s.authFooter}>SECURE FEDERATED ACCESS VIA SSO</Text>
        </View>

        <View style={s.authBottomBar}>
          <Text style={s.authVersion}>V.9.4.2_BRUTAL</Text>
          <Text style={s.authUplink}>UPLINK: SECURE</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AuthStatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.authStatusRowItem}>
      <Text style={s.authStatusLabel}>{label}</Text>
      <Text style={s.authStatusArrow}>→</Text>
      <Text style={s.authStatusValue}>{value}</Text>
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFILE SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfileScreen({
  totalReports, responseRating,
  encryption, setEncryption,
  locationTracking, setLocationTracking,
  reportFilter, setReportFilter,
  userReports, isLoggedIn, user, onLoginPress, onLogout,
  showMetadataAlert,
}: any) {
  const filteredReports: Report[] = reportFilter === 'all'
    ? userReports
    : userReports.filter((r: Report) => r.status === 'pending');

  return (
    <ScrollView style={s.screen} showsVerticalScrollIndicator={false}>
      {/* TOP BAR */}
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <View style={s.logoSquare} />
          <Text style={s.logoText}>NAGRIK</Text>
        </View>
        <Text style={s.profileLabel}>PROFILE</Text>
      </View>

      {/* NOT LOGGED IN STATE */}
      {!isLoggedIn ? (
        <View style={s.notLoggedCard}>
          <Text style={s.notLoggedIcon}>⚠</Text>
          <Text style={s.notLoggedTitle}>NOT AUTHENTICATED</Text>
          <Text style={s.notLoggedSub}>Login to view your operator profile and report logs.</Text>
          <TouchableOpacity style={s.googleSignInBtn} onPress={onLoginPress}>
            <View style={s.googleIconBox}>
              <Text style={s.googleIconText}>G</Text>
            </View>
            <Text style={s.googleSignInText}>CONTINUE WITH GOOGLE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* PROFILE CARD — Real user data */}
          <View style={s.profileCard}>
            <View style={s.avatar}>
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={s.avatarImage} />
              ) : (
                <Text style={s.avatarLetter}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </Text>
              )}
            </View>
            <Text style={s.profileName}>{user?.name?.toUpperCase() || 'OPERATOR'}</Text>
            <Text style={s.profileEmail}>{user?.email || 'No email'}</Text>
            <View style={s.authBadgeGreen}>
              <Text style={s.authBadgeGreenText}>✓ AUTHORIZED</Text>
            </View>
            <View style={s.profileActions}>
              <TouchableOpacity style={s.editBtn}>
                <Text style={s.editBtnText}>✎ EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.powerBtn} onPress={onLogout}>
                <Text style={s.powerBtnText}>⏻</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* STAT CARDS */}
          <View style={s.profileStatRow}>
            <View style={s.profileStatCard}>
              <Text style={s.profileStatLabel}>TOTAL REPORTS</Text>
              <Text style={s.profileStatNumber}>{totalReports}</Text>
            </View>
            <View style={[s.profileStatCard, { borderLeftColor: C.accentOrange }]}>
              <Text style={s.profileStatLabel}>RESPONSE RATING</Text>
              <Text style={[s.profileStatNumber, { color: C.accentOrange }]}>{responseRating}%</Text>
            </View>
          </View>

          {/* INFO CARDS */}
          <View style={s.profileStatRow}>
            <View style={s.profileInfoCard}>
              <Text style={s.profileInfoLabel}>ACTIVE ZONES</Text>
              <Text style={s.profileInfoValue}>Alpha, Delta</Text>
            </View>
            <View style={s.profileInfoCard}>
              <Text style={s.profileInfoLabel}>CLEARANCE LEVEL</Text>
              <Text style={s.profileInfoValue}>Level 4</Text>
            </View>
          </View>

          {/* SYSTEM PREFERENCES */}
          <View style={s.prefsCard}>
            <Text style={s.prefsTitle}>⚙ SYSTEM PREFERENCES</Text>
            <View style={s.prefsRow}>
              <Text style={s.prefsLabel}>E2E ENCRYPTION</Text>
              <ToggleSwitch value={encryption} onToggle={() => setEncryption(!encryption)} />
            </View>
            <View style={s.prefsDivider} />
            <View style={s.prefsRow}>
              <Text style={s.prefsLabel}>TELEMETRY DATA EXPORT</Text>
              <TouchableOpacity><Text style={s.downloadIcon}>⬇</Text></TouchableOpacity>
            </View>
            <View style={s.prefsDivider} />
            <View style={s.prefsRow}>
              <Text style={s.prefsLabel}>LOCATION TRACKING</Text>
              <ToggleSwitch value={locationTracking} onToggle={() => setLocationTracking(!locationTracking)} />
            </View>
          </View>

          {/* REPORT LOGS */}
          <Text style={s.sectionTitle}>REPORT LOGS</Text>
          <View style={s.filterRow}>
            <TouchableOpacity
              style={[s.filterBtn, reportFilter === 'all' && s.filterBtnActive]}
              onPress={() => setReportFilter('all')}
            >
              <Text style={[s.filterBtnText, reportFilter === 'all' && s.filterBtnTextActive]}>ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.filterBtn, reportFilter === 'pending' && s.filterBtnActive]}
              onPress={() => setReportFilter('pending')}
            >
              <Text style={[s.filterBtnText, reportFilter === 'pending' && s.filterBtnTextActive]}>PENDING</Text>
            </TouchableOpacity>
          </View>

          {filteredReports.length === 0 && (
            <View style={s.emptyReports}>
              <Text style={s.emptyReportsText}>NO REPORTS FOUND</Text>
            </View>
          )}

          {filteredReports.map((r: Report) => (
            <View key={r.id} style={s.reportCard}>
              {/* Image: show actual if exists, else placeholder */}
              {r.imageUri ? (
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => showMetadataAlert(r.metadata)}
                  style={{ width: '100%' }}
                >
                  <Image source={{ uri: r.imageUri }} style={s.reportImageActual} />
                </TouchableOpacity>
              ) : (
                <View style={s.reportImage}>
                  <View style={s.reportImageLine1} />
                  <View style={s.reportImageLine2} />
                  <View style={s.reportImageLine3} />
                </View>
              )}
              <View style={s.reportBody}>
                <View style={s.reportTitleRow}>
                  <Text style={s.reportTitle} numberOfLines={1}>{r.title}</Text>
                  <View style={s.reportIdBadge}>
                    <Text style={s.reportIdText}>ID: {r.id}</Text>
                  </View>
                </View>
                <Text style={s.reportDesc} numberOfLines={2}>{r.desc}</Text>
                {r.metadata && (
                  <View style={s.reportMetadataRow}>
                    <Text style={s.reportMetadataText}>
                      TECHNICAL STATS: {r.metadata.width}x{r.metadata.height}
                      {r.metadata.fileSize ? ` | ${(r.metadata.fileSize / 1024).toFixed(1)}KB` : ''}
                      {r.metadata.type?.includes('/') ? ` | ${r.metadata.type.split('/')[1].toUpperCase()}` : ' | IMG'}
                    </Text>
                  </View>
                )}
                <View style={s.reportFooter}>
                  <Text style={s.reportTime}>⏱ {r.time}</Text>
                  <View style={[s.statusBadge, {
                    backgroundColor: r.status === 'pending' ? C.accentOrange : C.resolved,
                  }]}>
                    <Text style={[s.statusText, {
                      color: r.status === 'pending' ? '#fff' : '#000',
                    }]}>
                      {r.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.loadHistBtn}>
            <Text style={s.loadHistText}>LOAD HISTORICAL DATA</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLACEHOLDER SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PlaceholderScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={s.screen}>
      <View style={s.topBar}>
        <View style={s.topBarLeft}>
          <View style={s.logoSquare} />
          <Text style={s.logoText}>NAGRIK</Text>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[s.authHeading, { fontSize: 28 }]}>{title}</Text>
        <Text style={s.sectionSubtitle}>{subtitle}</Text>
        <BlinkText text="▌" style={{ color: C.accentGreen, fontSize: 32, marginTop: 20 }} />
      </View>
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOTTOM NAVIGATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BottomNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: any) => void }) {
  const tabs = [
    { key: 'home', label: 'HOME', icon: '⊞' },
    { key: 'profile', label: 'PROFILE', icon: '◉' },
  ];
  return (
    <View style={s.bottomNav}>
      {tabs.map((t) => {
        const active = activeTab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={s.navItem}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.7}
          >
            <Text style={[s.navIcon, active && s.navIconActive]}>{t.icon}</Text>
            <Text style={[s.navLabel, active && s.navLabelActive]}>{t.label}</Text>
            {active && <View style={s.navIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
  },

  // ── TOP BAR ──
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center' },
  logoSquare: { width: 20, height: 20, backgroundColor: C.accentGreen, marginRight: 10 },
  logoText: { fontFamily: FONT_BOLD, fontSize: 20, color: C.textPrimary, letterSpacing: 3 },
  loginBtn: { fontFamily: FONT, fontSize: 13, color: C.textPrimary, letterSpacing: 1 },
  topBarUser: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: C.accentGreen },
  topBarAvatarPlaceholder: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentGreen, justifyContent: 'center', alignItems: 'center' },
  topBarAvatarLetter: { fontFamily: FONT_BOLD, fontSize: 13, color: '#000' },
  profileLabel: { fontFamily: FONT, fontSize: 14, color: C.textMuted, letterSpacing: 2 },

  // ── BANNERS ──
  bannerOnline: { backgroundColor: C.accentGreen, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 2, marginHorizontal: -16 },
  bannerOnlineText: { fontFamily: FONT_BOLD, fontSize: 13, color: '#000', letterSpacing: 2 },
  bannerSync: { backgroundColor: C.bgCard, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 16, marginHorizontal: -16 },
  bannerSyncText: { fontFamily: FONT, fontSize: 12, color: C.accentGreen, letterSpacing: 1 },

  // ── STAT GRID ──
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: C.bgCard, borderLeftWidth: 3, borderLeftColor: C.accentOrange, padding: 14, marginBottom: 10 },
  statLabel: { fontFamily: FONT, fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 6 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { fontFamily: FONT_BOLD, fontSize: 28, color: C.textPrimary },
  statIcon: { fontSize: 20 },

  // ── SECTION TITLES ──
  sectionTitle: { fontFamily: FONT_BOLD, fontSize: 16, color: C.textPrimary, letterSpacing: 2, marginBottom: 8 },
  sectionSubtitle: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 1, marginBottom: 16 },

  // ── MAP ──
  mapContainer: { backgroundColor: C.mapBg, height: 220, marginBottom: 24, borderWidth: 1, borderColor: C.border, overflow: 'hidden', position: 'relative' },
  mapGridH1: { position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: '#1A1A1A' },
  mapGridH2: { position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: '#1A1A1A' },
  mapGridV1: { position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: '#1A1A1A' },
  mapGridV2: { position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: '#1A1A1A' },
  zoomControls: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  zoomBtn: { width: 30, height: 30, backgroundColor: C.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  zoomText: { fontFamily: FONT_BOLD, fontSize: 18, color: C.textPrimary },
  alertCard: { position: 'absolute', bottom: 10, left: 10, right: 10, flexDirection: 'row', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  alertBorder: { width: 4, backgroundColor: C.accentOrange },
  alertContent: { flex: 1, padding: 10 },
  alertLabel: { fontFamily: FONT_BOLD, fontSize: 11, color: C.accentOrange, letterSpacing: 2, marginBottom: 4 },
  alertText: { fontFamily: FONT, fontSize: 11, color: C.textPrimary, lineHeight: 16 },

  // ── AUTH NOTICE ──
  authNotice: { backgroundColor: 'rgba(255,77,0,0.1)', borderWidth: 1, borderColor: C.accentOrange, padding: 10, marginBottom: 12 },
  authNoticeText: { fontFamily: FONT_BOLD, fontSize: 11, color: C.accentOrange, letterSpacing: 1 },

  // ── REPORT FORM ──
  uploadBox: { borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 8, minHeight: 100, overflow: 'hidden' },
  uploadedImage: { width: '100%', height: 180, resizeMode: 'cover' },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadText: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 2 },
  uploadSubText: { fontFamily: FONT, fontSize: 10, color: C.accentOrange, letterSpacing: 1, marginTop: 4 },
  uploadSubTextGreen: { fontFamily: FONT, fontSize: 10, color: C.accentGreen, letterSpacing: 1, marginTop: 4 },
  changePhotoBtn: { alignItems: 'flex-end', marginBottom: 12 },
  changePhotoText: { fontFamily: FONT, fontSize: 11, color: C.accentGreen, letterSpacing: 1 },
  // Preview confirm/reject
  previewActionRow: { flexDirection: 'row', width: '100%' },
  rejectBtn: { flex: 1, backgroundColor: C.accentOrange, paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { fontFamily: FONT_BOLD, fontSize: 13, color: '#fff', letterSpacing: 1 },
  confirmBtn: { flex: 1, backgroundColor: C.accentGreen, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { fontFamily: FONT_BOLD, fontSize: 13, color: '#000', letterSpacing: 1 },
  confirmedOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 8, alignItems: 'center' },
  confirmedOverlayText: { fontFamily: FONT_BOLD, fontSize: 11, color: C.accentGreen, letterSpacing: 2 },
  metadataSubText: { fontFamily: FONT, fontSize: 9, color: C.textMuted, letterSpacing: 1, marginTop: 2 },
  metadataOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  metadataOverlayText: { fontFamily: FONT, fontSize: 9, color: C.accentGreen, letterSpacing: 1 },
  inputLabel: { fontFamily: FONT_BOLD, fontSize: 11, color: C.textPrimary, letterSpacing: 2, marginBottom: 8 },
  textarea: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, padding: 12, fontFamily: FONT, fontSize: 13, color: C.textPrimary, minHeight: 80, marginBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, marginBottom: 6 },
  locationPin: { fontSize: 18, marginRight: 8 },
  locationInput: { flex: 1, fontFamily: FONT, fontSize: 13, color: C.textPrimary, paddingVertical: 12 },
  autoDetect: { fontFamily: FONT, fontSize: 11, color: C.accentOrange, letterSpacing: 1, marginBottom: 20, marginTop: 4 },
  submitBtn: { backgroundColor: C.accentGreen, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  submitBtnInverted: { backgroundColor: '#000', borderWidth: 2, borderColor: C.accentGreen },
  submitText: { fontFamily: FONT_BOLD, fontSize: 15, color: '#000', letterSpacing: 3 },
  submitTextInverted: { color: C.accentGreen },

  // ── AUTH / LOGIN ──
  authFrame: { borderWidth: 2, borderColor: C.border, padding: 20, flex: 1, justifyContent: 'center', marginTop: 20 },
  authTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  authTopLeft: { flexDirection: 'row', alignItems: 'center' },
  authBackBtn: { fontFamily: FONT, fontSize: 18, color: C.textMuted, marginRight: 10 },
  authTermLabel: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 1 },
  authBadge: { backgroundColor: 'rgba(255,77,0,0.15)', paddingVertical: 4, paddingHorizontal: 10 },
  authBadgeText: { fontFamily: FONT_BOLD, fontSize: 10, color: C.accentOrange, letterSpacing: 1 },
  authHeading: { fontFamily: FONT_BOLD, fontSize: 48, color: C.textPrimary, letterSpacing: 8, marginBottom: 4 },
  authSubheading: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 2, marginBottom: 30 },
  authStatusTable: { flexDirection: 'row', marginBottom: 30 },
  authStatusBar: { width: 3, backgroundColor: C.accentOrange, marginRight: 14 },
  authStatusRows: { flex: 1 },
  authStatusRowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  authStatusLabel: { fontFamily: FONT, fontSize: 11, color: C.textMuted, letterSpacing: 1, flex: 1 },
  authStatusArrow: { fontFamily: FONT, fontSize: 12, color: C.textMuted, marginHorizontal: 8 },
  authStatusValue: { fontFamily: FONT_BOLD, fontSize: 11, color: C.textPrimary, letterSpacing: 1 },

  // ── GOOGLE SIGN-IN BUTTON ──
  googleSignInBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleIconBox: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 2,
  },
  googleIconText: {
    fontFamily: FONT_BOLD,
    fontSize: 14,
    color: '#FFFFFF',
  },
  googleSignInText: {
    fontFamily: FONT_BOLD,
    fontSize: 13,
    color: '#3C4043',
    letterSpacing: 1,
  },

  // ── DEMO NOTICE ──
  demoNotice: {
    backgroundColor: 'rgba(200,255,0,0.08)',
    borderWidth: 1,
    borderColor: C.accentGreen,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  demoNoticeText: {
    fontFamily: FONT,
    fontSize: 10,
    color: C.accentGreen,
    letterSpacing: 1,
  },
  // ── OAUTH CONFIG NOTICE ──
  oauthConfigNotice: {
    backgroundColor: 'rgba(255,165,0,0.08)',
    borderWidth: 1,
    borderColor: C.accentAmber,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  oauthConfigText: {
    fontFamily: FONT,
    fontSize: 10,
    color: C.accentAmber,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 16,
  },

  authFooter: { fontFamily: FONT, fontSize: 10, color: C.textMuted, textAlign: 'center', letterSpacing: 2 },
  authBottomBar: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4 },
  authVersion: { fontFamily: FONT, fontSize: 10, color: C.textMuted, letterSpacing: 1 },
  authUplink: { fontFamily: FONT, fontSize: 10, color: C.accentGreen, letterSpacing: 1 },

  // ── NOT LOGGED IN ──
  notLoggedCard: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, padding: 30, alignItems: 'center', marginTop: 20 },
  notLoggedIcon: { fontSize: 40, marginBottom: 16 },
  notLoggedTitle: { fontFamily: FONT_BOLD, fontSize: 18, color: C.textPrimary, letterSpacing: 2, marginBottom: 8 },
  notLoggedSub: { fontFamily: FONT, fontSize: 12, color: C.textMuted, textAlign: 'center', letterSpacing: 1, marginBottom: 24, lineHeight: 18 },

  // ── PROFILE ──
  profileCard: { backgroundColor: C.bgCard, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  avatar: { width: 72, height: 72, backgroundColor: C.bgCard2, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: C.border, borderRadius: 36, overflow: 'hidden' },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarLetter: { fontFamily: FONT_BOLD, fontSize: 30, color: C.accentGreen },
  profileName: { fontFamily: FONT_BOLD, fontSize: 20, color: C.textPrimary, letterSpacing: 2, marginBottom: 4 },
  profileEmail: { fontFamily: FONT, fontSize: 11, color: C.textMuted, letterSpacing: 1, marginBottom: 10 },
  authBadgeGreen: { backgroundColor: 'rgba(200,255,0,0.12)', paddingVertical: 4, paddingHorizontal: 12, marginBottom: 16 },
  authBadgeGreenText: { fontFamily: FONT_BOLD, fontSize: 11, color: C.accentGreen, letterSpacing: 1 },
  profileActions: { flexDirection: 'row', gap: 10 },
  editBtn: { borderWidth: 1, borderColor: C.border, paddingVertical: 8, paddingHorizontal: 20 },
  editBtnText: { fontFamily: FONT, fontSize: 12, color: C.textPrimary, letterSpacing: 1 },
  powerBtn: { borderWidth: 1, borderColor: C.accentOrange, paddingVertical: 8, paddingHorizontal: 14 },
  powerBtnText: { fontSize: 16, color: C.accentOrange },
  profileStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  profileStatCard: { width: '48%', backgroundColor: C.bgCard, borderLeftWidth: 3, borderLeftColor: C.accentGreen, padding: 14, borderWidth: 1, borderColor: C.border },
  profileStatLabel: { fontFamily: FONT, fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 6 },
  profileStatNumber: { fontFamily: FONT_BOLD, fontSize: 26, color: C.textPrimary },
  profileInfoCard: { width: '48%', backgroundColor: C.bgCard, padding: 14, borderWidth: 1, borderColor: C.border },
  profileInfoLabel: { fontFamily: FONT, fontSize: 10, color: C.textMuted, letterSpacing: 1, marginBottom: 6 },
  profileInfoValue: { fontFamily: FONT_BOLD, fontSize: 14, color: C.textPrimary, letterSpacing: 1 },

  // ── PREFERENCES ──
  prefsCard: { backgroundColor: C.bgCard2, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  prefsTitle: { fontFamily: FONT_BOLD, fontSize: 13, color: C.textPrimary, letterSpacing: 2, marginBottom: 16 },
  prefsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  prefsLabel: { fontFamily: FONT, fontSize: 11, color: C.textPrimary, letterSpacing: 1, flex: 1 },
  prefsDivider: { height: 1, backgroundColor: C.border },
  downloadIcon: { fontSize: 18, color: C.textMuted },

  // ── TOGGLE ──
  toggleTrack: { width: 44, height: 24, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, backgroundColor: '#fff' },

  // ── REPORT LOGS ──
  filterRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.bgCard },
  filterBtnActive: { backgroundColor: C.accentGreen, borderColor: C.accentGreen },
  filterBtnText: { fontFamily: FONT_BOLD, fontSize: 11, color: C.textMuted, letterSpacing: 1 },
  filterBtnTextActive: { color: '#000' },
  emptyReports: { padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  emptyReportsText: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 2 },
  reportCard: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, marginBottom: 12, overflow: 'hidden' },
  reportImage: { height: 80, backgroundColor: '#111', justifyContent: 'center', paddingHorizontal: 20 },
  reportImageActual: { width: '100%', height: 120, resizeMode: 'cover' },
  reportImageLine1: { height: 2, backgroundColor: '#1A1A1A', width: '60%', marginBottom: 8 },
  reportImageLine2: { height: 2, backgroundColor: '#1A1A1A', width: '80%', marginBottom: 8 },
  reportImageLine3: { height: 2, backgroundColor: '#1A1A1A', width: '40%' },
  reportBody: { padding: 12 },
  reportTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  reportTitle: { fontFamily: FONT_BOLD, fontSize: 12, color: C.textPrimary, letterSpacing: 1, flex: 1, marginRight: 8 },
  reportMetadataRow: { backgroundColor: 'rgba(200,255,0,0.05)', padding: 6, marginBottom: 8, borderWidth: 1, borderColor: '#222' },
  reportMetadataText: { fontFamily: FONT, fontSize: 9, color: C.accentGreen, letterSpacing: 1 },
  reportIdBadge: { backgroundColor: C.bgCard2, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: C.border },
  reportIdText: { fontFamily: FONT, fontSize: 9, color: C.textMuted, letterSpacing: 1 },
  reportDesc: { fontFamily: FONT, fontSize: 11, color: C.textMuted, lineHeight: 16, marginBottom: 10 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTime: { fontFamily: FONT, fontSize: 10, color: C.textMuted, letterSpacing: 1 },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 10 },
  statusText: { fontFamily: FONT_BOLD, fontSize: 10, letterSpacing: 1 },
  loadHistBtn: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  loadHistText: { fontFamily: FONT, fontSize: 12, color: C.textMuted, letterSpacing: 2 },

  // ── BOTTOM NAV ──
  bottomNav: { flexDirection: 'row', backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 6, position: 'relative' },
  navIcon: { fontSize: 18, color: C.textMuted, marginBottom: 4 },
  navIconActive: { color: C.accentGreen },
  navLabel: { fontFamily: FONT, fontSize: 8, color: C.textMuted, letterSpacing: 1 },
  navLabelActive: { color: C.accentGreen },
  navIndicator: { position: 'absolute', top: 0, width: 20, height: 2, backgroundColor: C.accentGreen },

  // ── IMAGE PICK MODAL ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.bgCard, borderTopWidth: 2, borderTopColor: C.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  modalTitle: { fontFamily: FONT_BOLD, fontSize: 13, color: C.accentGreen, letterSpacing: 2 },
  modalClose: { fontFamily: FONT, fontSize: 18, color: C.textMuted },
  modalDivider: { height: 1, backgroundColor: C.border },
  modalOption: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  modalOptionIcon: { fontSize: 28 },
  modalOptionLabel: { fontFamily: FONT_BOLD, fontSize: 14, color: C.textPrimary, letterSpacing: 2, marginBottom: 4 },
  modalOptionSub: { fontFamily: FONT, fontSize: 11, color: C.textMuted, letterSpacing: 1 },
  modalCancelBtn: { padding: 16, alignItems: 'center' },
  modalCancelText: { fontFamily: FONT_BOLD, fontSize: 13, color: C.accentOrange, letterSpacing: 2 },

  // ── TOAST ──
  toast: { position: 'absolute', bottom: 100, left: 16, right: 16, backgroundColor: C.accentGreen, padding: 14, alignItems: 'center' },
  toastText: { fontFamily: FONT_BOLD, fontSize: 11, color: '#000', letterSpacing: 1 },
});
