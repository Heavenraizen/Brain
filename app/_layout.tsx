import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth, AuthProvider } from '@/context/AuthContext';

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PlusJakartaSans_Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    PlusJakartaSans_Bold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const { authUser, authLoading } = useAuth();

  useEffect(() => {
    // Only proceed once fonts are loaded and auth state is resolved
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync(); // Hide splash screen after everything is ready

      if (!authUser) {
        router.replace('/'); // Redirect to login if not authenticated
      } else {
        router.replace('/(tabs)/home'); // Redirect to home if authenticated
      }
    }
  }, [authUser, authLoading, fontsLoaded, router]);

  if (!fontsLoaded || authLoading) {
    // Show splash screen or loading indicator while fonts and auth state are loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#609AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
