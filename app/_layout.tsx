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
import { CopilotProvider } from 'react-native-copilot';
import { TourTooltip } from '../components/TourTooltip';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { ThemeProvider, useTheme } from '../context/ThemeContext';


export const unstable_settings = {
  initialRouteName: 'onboarding',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Outfit_400Regular: require('../assets/fonts/Outfit-Regular.ttf'),
    Outfit_500Medium: require('../assets/fonts/Outfit-Medium.ttf'),
    Outfit_600SemiBold: require('../assets/fonts/Outfit-SemiBold.ttf'),
    Outfit_700Bold: require('../assets/fonts/Outfit-Bold.ttf'),
    Outfit_800ExtraBold: require('../assets/fonts/Outfit-ExtraBold.ttf'),
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
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

function InnerLayout() {
  const { theme, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CopilotProvider
          tooltipComponent={TourTooltip}
          overlay="view"
          animated={true}
          labels={{
            next: 'Next',
            previous: 'back',
            skip: 'Skip',
            finish: 'Finish'
          }}
          backdropColor="rgba(0,0,0,0.8)"
          verticalOffset={30}
        >
          <ToastProvider>
            <Stack
              initialRouteName="onboarding"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background }
              }}
            >
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </CopilotProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

