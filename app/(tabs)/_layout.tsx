import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";

// A simple helper to render playful custom icons
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{name}</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "System", // Match your typography body font
          fontWeight: "600",
          fontSize: 12,
        },
        headerShown: false, // Hide headers to make it look cleaner
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="input"
        options={{
          title: "Study",
          tabBarIcon: ({ focused }) => <TabIcon name="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => <TabIcon name="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon name="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

import { Text } from "react-native";

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 20,
  },
  iconFocused: {
    backgroundColor: "#F0EFFF", // Very light primary color
  },
});
