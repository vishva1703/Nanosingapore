import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { ActivityProvider } from "@/components/ActivityContext";
import { FoodProvider } from "@/components/FoodContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <FoodProvider>
    <ActivityProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>

          {/* ONBOARDING SCREENS */}
          <Stack.Screen name="screens/welcomescreen" />
          <Stack.Screen name="screens/onboarding" />
          <Stack.Screen name="screens/workout-frequency" />
          <Stack.Screen name="screens/WeightScreen" />
          <Stack.Screen name="screens/birth-date" />
          <Stack.Screen name="screens/goalscreen" />
          <Stack.Screen name="screens/desiredscreen" />
          <Stack.Screen name="screens/fastgoalscreen" />
          <Stack.Screen name="screens/losingwightscreen" />
          <Stack.Screen name="screens/dietscreen" />
          <Stack.Screen name="screens/stopinggoalscreen" />
          <Stack.Screen name="screens/accomplishscreen" />
          <Stack.Screen name="screens/potentialscreen" />
          <Stack.Screen name="screens/greatingscreen" />
          <Stack.Screen name="screens/planscreen" />
          <Stack.Screen name="screens/loginscreen" />

          {/* TABS GROUP */}
          <Stack.Screen name="(tabs)" />

        </Stack>
      </ThemeProvider>
    </ActivityProvider>
    </FoodProvider>
  );
}
