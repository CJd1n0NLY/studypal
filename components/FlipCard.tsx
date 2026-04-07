import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";
import { playSound } from "../services/soundManager";

interface FlipCardProps {
  frontText: string;
  backText: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ frontText, backText }) => {
  const [isLocked, setIsLocked] = useState(false);
  const flip = useSharedValue(0);
  const scale = useSharedValue(1);

  // Reset flip when card content changes (next card)
  useEffect(() => {
    flip.value = withSpring(0, { damping: 14, stiffness: 120 });
  }, [frontText, backText]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${spinVal}deg` },
        { scale: scale.value },
      ],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(flip.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${spinVal}deg` },
        { scale: scale.value },
      ],
    };
  });

  const handleFlip = async () => {
    if (isLocked) return;
    setIsLocked(true);

    scale.value = withSpring(0.95, { damping: 8, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    flip.value = withSpring(Math.round(flip.value) === 0 ? 1 : 0, {
      damping: 13,
      stiffness: 110,
    });
    await playSound("flipcard");

    setTimeout(() => setIsLocked(false), 400);
  };

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      {/* Front Face */}
      <Animated.View
        style={[styles.card, styles.cardFront, frontAnimatedStyle]}
      >
        <Text style={styles.hintText}>TAP TO FLIP</Text>
        <Text style={styles.frontText}>{frontText}</Text>
        <Text style={styles.tapIcon}>👆</Text>
      </Animated.View>

      {/* Back Face */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <Text style={styles.hintText}>DEFINITION</Text>
        <Text style={styles.backText}>{backText}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 380,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  cardFront: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: "#EAE8FF",
  },
  cardBack: {
    backgroundColor: "#F0EFFF",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  hintText: {
    position: "absolute",
    top: 20,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: Colors.text.muted,
    opacity: 0.6,
  },
  frontText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.dark,
    textAlign: "center",
    lineHeight: 32,
  },
  backText: {
    fontSize: 18,
    color: Colors.text.dark,
    textAlign: "center",
    lineHeight: 26,
  },
  tapIcon: {
    position: "absolute",
    bottom: 20,
    fontSize: 20,
    opacity: 0.4,
  },
});
