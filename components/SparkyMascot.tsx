import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { Colors } from "../constants/colors";

interface SparkyProps {
  size?: number;
}

export const SparkyMascot: React.FC<SparkyProps> = ({ size = 100 }) => {
  // Shared value for the vertical floating animation
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Continuous floating animation (up and down)
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // -1 means infinite loop
      true, // reverse
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Glow effect behind Sparky */}
        <Circle cx="50" cy="50" r="45" fill={Colors.warning} opacity={0.15} />

        {/* Main Lightning Bolt Body */}
        <Path
          d="M58 10L25 55h20l-5 35 35-45H55l8-35z"
          fill="#FFD700"
          stroke={Colors.warning}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Left Eye */}
        <Circle cx="42" cy="45" r="4" fill="#2D2B55" />
        {/* Right Eye */}
        <Circle cx="58" cy="45" r="4" fill="#2D2B55" />

        {/* Eye Highlights (makes him look cute and alive) */}
        <Circle cx="40" cy="43" r="1.5" fill="white" />
        <Circle cx="56" cy="43" r="1.5" fill="white" />

        {/* Cheeks */}
        <Circle cx="35" cy="50" r="3.5" fill="#FF6584" opacity={0.6} />
        <Circle cx="65" cy="50" r="3.5" fill="#FF6584" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
