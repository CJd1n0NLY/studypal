import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";
// 1. Import Ionicons
import { Ionicons } from "@expo/vector-icons";

// 2. Update the helper to accept Ionicons names
const TabIcon = ({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconFocused]}>
    <Ionicons
      name={name}
      size={24}
      color={focused ? Colors.primary : Colors.text.muted}
    />
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
          height: Platform.OS === "android" ? 75 : 85,
          paddingBottom: Platform.OS === "android" ? 10 : 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "System",
          fontWeight: "600",
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      {/* 3. Swap emojis for real icon names */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="input"
        options={{
          title: "Study",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "bulb" : "bulb-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "library" : "library-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "settings" : "settings-outline"}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 20,
  },
  iconFocused: {
    backgroundColor: "#F0EFFF",
  },
});
