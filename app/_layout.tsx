/**
 * Root Layout - Redux Provider + Database Init
 * 100% Offline React Native App
 */

import { Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Text, View, Animated, Image, StyleSheet, Dimensions } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { SnackbarProvider } from '../components/GlobalSnackbar';
import { initializeDatabase } from '../database/init';
import '../global.css';
import { RootState, store } from '../redux/store';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});
import { registerForPushNotificationsAsync, scheduleReviewReminder } from '../services/notifications';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go',
  'expo-notifications: Android Push notifications'
]);

function AppContent() {
  const { darkMode, themeColor } = useSelector((state: RootState) => state.settings);

  const theme = {
    ...(darkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(darkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: themeColor,
      secondary: darkMode ? '#94A3B8' : '#1E293B',
      background: darkMode ? '#0F172A' : '#F8FAFC',
      error: '#EF4444',
      surface: darkMode ? '#1E293B' : '#FFFFFF',
      onSurface: darkMode ? '#F8FAFC' : '#0F172A',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <SnackbarProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="note/[id]"
              options={{
                title: 'Edit Note',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="notebooks"
              options={{
                title: 'Notebooks',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="notebook/[id]"
              options={{
                title: 'Notebook Details',
                presentation: 'card'
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </SnackbarProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splashFinished, setSplashFinished] = useState(false);
  
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    async function init() {
      try {
        console.log('🚀 Initializing offline database...');
        await initializeDatabase();
        setDbReady(true);

        // Setup Notifications
        await registerForPushNotificationsAsync();
        scheduleReviewReminder(5);

        console.log('✅ App ready!');
      } catch (err) {
        console.error('❌ Init failed:', err);
        setError((err as Error).message);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (dbReady || error) {
      // Hide native splash immediately
      SplashScreen.hideAsync().catch(() => {});

      // Start custom animation
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true,
        }),
        // Add a deliberate 1.5s delay before fading out to show the beautiful logo
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        setSplashFinished(true);
      });
    }
  }, [dbReady, error]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Database Error
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>{error}</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      {dbReady && <AppContent />}
      
      {!splashFinished && (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0F172A', opacity, justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
          <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
            <Image 
              source={require('../assets/branding/logo.png')} 
              style={{ width: 120, height: 120, borderRadius: 30, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 2 }}>THINKSTACK</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 8, letterSpacing: 1 }}>Your Offline Mind</Text>
          </Animated.View>
        </Animated.View>
      )}
    </Provider>
  );
}
