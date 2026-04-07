import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "../components/ToastNotification";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#F8F7FF" },
            headerShadowVisible: false,
            headerTintColor: "#6C63FF",
            headerTitleStyle: { fontWeight: "700", fontSize: 17 },
            contentStyle: { backgroundColor: "#F8F7FF" },
            animation: "default",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
