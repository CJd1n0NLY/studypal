import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";

interface BouncyButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  type?: "primary" | "secondary" | "outline";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  type = "primary",
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  // Determine colors based on button type
  const getBackgroundColor = () => {
    if (type === "secondary") return Colors.secondary;
    if (type === "outline") return "transparent";
    return Colors.primary;
  };

  const getTextColor = () => {
    if (type === "outline") return Colors.primary;
    return Colors.surface;
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        type === "outline" && styles.outlineButton,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24, // High border-radius for that bubbly/cartoonish feel
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System", // Or your header font
  },
});
