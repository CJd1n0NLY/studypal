import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { Colors } from "../../constants/colors";

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
      size={22}
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
          height: Platform.OS === "android" ? 68 : 85,
          paddingBottom: Platform.OS === "android" ? 8 : 25,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "System",
          fontWeight: "600",
          fontSize: 11,
        },
        headerShown: false,
      }}
    >
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
    width: 40,
    height: 32,
    borderRadius: 16,
  },
  iconFocused: {
    backgroundColor: "#F0EFFF",
  },
});
