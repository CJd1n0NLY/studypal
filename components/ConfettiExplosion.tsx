import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";
import { playSound } from "../services/soundManager";

const NUM_PARTICLES = 40;
const CONFETTI_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.warning,
  "#FFD700",
  "#9b59b6",
  "#00BCD4",
  "#FF5722",
];

const SHAPES = ["circle", "square", "rectangle"] as const;

interface ConfettiProps {
  trigger: boolean;
}

export const ConfettiExplosion: React.FC<ConfettiProps> = ({ trigger }) => {
  useEffect(() => {
    if (trigger) {
      playSound("celebrate");
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(NUM_PARTICLES)].map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

const Particle = ({ index }: { index: number }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const destX = (Math.random() - 0.5) * 500;
  const destY = (Math.random() - 0.5) * 700 - 250;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = Math.random() * 10 + 6;
  const shape = SHAPES[index % SHAPES.length];
  const delay = Math.random() * 200;

  useEffect(() => {
    x.value = withDelay(
      delay,
      withSpring(destX, { damping: 10, stiffness: 60 }),
    );
    y.value = withDelay(
      delay,
      withSpring(destY, { damping: 10, stiffness: 60 }),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 8, stiffness: 120 }),
    );
    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 900 - 450, { duration: 2500 }),
    );
    opacity.value = withDelay(delay + 1600, withTiming(0, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const borderRadius =
    shape === "circle" ? size / 2 : shape === "square" ? 3 : 2;
  const width = shape === "rectangle" ? size * 1.8 : size;

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          backgroundColor: color,
          width,
          height: size,
          borderRadius,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 100,
  },
});
