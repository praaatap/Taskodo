import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../context/ToastContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShowcaseProvider } from '../components/Showcase';
import { AnimatedSplash } from '../components/AnimatedSplash';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // We let the AnimatedSplash component hide the native splash screen
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <RootLayoutNav />
      {!splashFinished && (
        <AnimatedSplash onFinish={() => setSplashFinished(true)} />
      )}
    </View>
  );
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ShowcaseProvider>
          <ToastProvider>
            <Stack
              initialRouteName="onboarding"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' }
              }}
            >
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </ShowcaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
