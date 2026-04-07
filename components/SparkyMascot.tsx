import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { Colors } from "../constants/colors";

export type SparkyMood =
  | "default"
  | "happy"
  | "thinking"
  | "sad"
  | "excited"
  | "speaking";

interface SparkyProps {
  size?: number;
  mood?: SparkyMood;
}

export const SparkyMascot: React.FC<SparkyProps> = ({
  size = 100,
  mood = "default",
}) => {
  const translateY = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Reset
    rotation.value = withTiming(0, { duration: 100 });
    scaleX.value = withSpring(1);

    if (mood === "excited") {
      // Bounce rapidly
      translateY.value = withRepeat(
        withSequence(
          withTiming(-16, {
            duration: 300,
            easing: Easing.out(Easing.back(3)),
          }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
      // Slight left-right wobble
      rotation.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 180 }),
          withTiming(8, { duration: 180 }),
          withTiming(0, { duration: 180 }),
        ),
        -1,
        false,
      );
    } else if (mood === "thinking") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      // Tilt slightly
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1200 }),
          withTiming(5, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else if (mood === "sad") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else if (mood === "speaking") {
      // Quick vertical pulse like talking
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400 }),
          withTiming(-2, { duration: 400 }),
          withTiming(-8, { duration: 400 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      // Default gentle float
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scaleX: scaleX.value },
    ],
  }));

  const renderMouth = () => {
    switch (mood) {
      case "happy":
      case "excited":
        return (
          <Path
            d="M37 57 Q50 70 63 57"
            stroke="#2D2B55"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "sad":
        return (
          <Path
            d="M38 63 Q50 53 62 63"
            stroke="#2D2B55"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "thinking":
        return (
          <G>
            <Path
              d="M43 58 Q50 61 57 58"
              stroke="#2D2B55"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Thought bubble dots */}
            <Circle cx="68" cy="30" r="3" fill="#FFD700" opacity={0.7} />
            <Circle cx="74" cy="22" r="4.5" fill="#FFD700" opacity={0.8} />
            <Circle cx="72" cy="12" r="6" fill="#FFD700" opacity={0.9} />
          </G>
        );
      case "speaking":
        return (
          <G>
            {/* Open mouth */}
            <Path
              d="M40 56 Q50 66 60 56"
              stroke="#2D2B55"
              strokeWidth="3"
              strokeLinecap="round"
              fill="#FF6584"
              fillOpacity={0.3}
            />
            {/* Sound waves */}
            <Path
              d="M70 45 Q74 50 70 55"
              stroke="#6C63FF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity={0.6}
            />
            <Path
              d="M75 40 Q82 50 75 60"
              stroke="#6C63FF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity={0.4}
            />
          </G>
        );
      default:
        return (
          <Path
            d="M44 56 Q50 60 56 56"
            stroke="#2D2B55"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        );
    }
  };

  const renderEyes = () => {
    if (mood === "happy") {
      return (
        <G>
          {/* Happy crescent eyes */}
          <Path
            d="M36 46 Q42 40 48 46"
            stroke="#2D2B55"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M52 46 Q58 40 64 46"
            stroke="#2D2B55"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    }
    if (mood === "excited") {
      return (
        <G>
          <Path
            d="M35 47 Q42 38 49 47"
            stroke="#2D2B55"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M51 47 Q58 38 65 47"
            stroke="#2D2B55"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Stars near eyes */}
          <Path
            d="M28 32 L30 28 L32 32 L28 30 L32 30Z"
            fill="#FFD700"
            opacity={0.9}
          />
          <Path
            d="M68 32 L70 28 L72 32 L68 30 L72 30Z"
            fill="#FFD700"
            opacity={0.9}
          />
        </G>
      );
    }
    if (mood === "sad") {
      return (
        <G>
          <Circle cx="42" cy="46" r="5" fill="#2D2B55" />
          <Circle cx="58" cy="46" r="5" fill="#2D2B55" />
          <Circle cx="40" cy="44" r="2" fill="white" />
          <Circle cx="56" cy="44" r="2" fill="white" />
          {/* Teardrop */}
          <Ellipse cx="60" cy="54" rx="2" ry="3" fill="#6C9EFF" opacity={0.7} />
        </G>
      );
    }
    if (mood === "thinking") {
      return (
        <G>
          <Circle cx="42" cy="44" r="5" fill="#2D2B55" />
          <Circle cx="59" cy="43" r="5" fill="#2D2B55" />
          <Circle cx="40" cy="42" r="2" fill="white" />
          <Circle cx="57" cy="41" r="2" fill="white" />
          {/* Raised eyebrow */}
          <Path
            d="M37 36 Q42 32 47 35"
            stroke="#2D2B55"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    }
    // Default / speaking
    return (
      <G>
        <Circle cx="42" cy="45" r="5" fill="#2D2B55" />
        <Circle cx="58" cy="45" r="5" fill="#2D2B55" />
        <Circle cx="40" cy="43" r="2" fill="white" />
        <Circle cx="56" cy="43" r="2" fill="white" />
      </G>
    );
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Glow halo */}
        <Ellipse
          cx="50"
          cy="55"
          rx="40"
          ry="10"
          fill={Colors.warning}
          opacity={0.1}
        />

        {/* Lightning bolt body */}
        <Path
          d="M58 8L23 52h22l-5 40 38-48H55l8-36z"
          fill="#FFD700"
          stroke={Colors.warning}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner bolt highlight */}
        <Path
          d="M54 14L32 48h15l-3 26 25-32H52l6-28z"
          fill="#FFE55C"
          opacity={0.5}
        />

        {renderEyes()}
        {renderMouth()}

        {/* Cheek blush */}
        <Ellipse
          cx="33"
          cy="52"
          rx="5"
          ry="3.5"
          fill="#FF6584"
          opacity={0.45}
        />
        <Ellipse
          cx="67"
          cy="52"
          rx="5"
          ry="3.5"
          fill="#FF6584"
          opacity={0.45}
        />

        {/* Sparkles when happy/excited */}
        {(mood === "happy" || mood === "excited") && (
          <G>
            <Path
              d="M18 20 L20 15 L22 20 L18 18 L22 18Z"
              fill="#FFD700"
              opacity={0.8}
            />
            <Path
              d="M80 25 L82 18 L84 25 L80 22 L84 22Z"
              fill="#FF6584"
              opacity={0.8}
            />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
