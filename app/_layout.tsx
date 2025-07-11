import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";
import ErrorBoundary from "@/components/ErrorBoundary";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: Colors.dark.text,
            fontFamily: 'System',
          },
          headerTintColor: Colors.dark.primary,
          contentStyle: {
            backgroundColor: Colors.dark.background,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "AML Checker",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="screening-history" 
          options={{ 
            title: "Screening History",
          }} 
        />
        <Stack.Screen 
          name="address-details" 
          options={{ 
            title: "Address Details",
          }} 
        />
      </Stack>
    </ErrorBoundary>
  );
}
