/**
 * Root Layout - Redux Provider + Database Init
 * 100% Offline React Native App
 */

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { SnackbarProvider } from '../components/GlobalSnackbar';
import { initializeDatabase } from '../database/init';
import '../global.css';
import { RootState, store } from '../redux/store';
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

  useEffect(() => {
    async function init() {
      try {
        console.log('🚀 Initializing offline database...');
        await initializeDatabase();
        setDbReady(true);

        // Setup Notifications
        await registerForPushNotificationsAsync();
        // Initial schedule
        scheduleReviewReminder(5); // Example, ideally get from DB

        console.log('✅ App ready!');
      } catch (err) {
        console.error('❌ Init failed:', err);
        setError((err as Error).message);
      }
    }
    init();
  }, []);

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

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading database...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
