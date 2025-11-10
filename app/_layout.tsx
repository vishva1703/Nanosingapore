import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Animated } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="welcomescreen">
        <Stack.Screen name="welcomescreen" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="workout-frequency" options={{ headerShown: false }} />
        <Stack.Screen name="WeightScreen" options={{ headerShown: false }} />
<Stack.Screen name="birth-date" options={{ headerShown: false }} />
<Stack.Screen name="goalscreen" options={{ headerShown: false }} />
<Stack.Screen name="desiredscreen" options={{ headerShown: false }} />
<Stack.Screen name="fastgoalscreen" options={{ headerShown: false }} />
<Stack.Screen name="losingwightscreen" options={{ headerShown: false }} />
<Stack.Screen name="dietscreen" options={{ headerShown: false }} />
<Stack.Screen name="stopinggoalscreen" options={{ headerShown: false }} />
<Stack.Screen name="accomplishscreen" options={{ headerShown: false }} />
<Stack.Screen name="potentialscreen" options={{ headerShown: false }} />
<Stack.Screen name="greatingscreen" options={{ headerShown: false }} />
<Stack.Screen name="planscreen" options={{ headerShown: false }} />
<Stack.Screen name="loginscreen" options={{ headerShown: false }} />
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
