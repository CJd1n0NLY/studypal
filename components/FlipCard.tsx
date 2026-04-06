import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";

interface FlipCardProps {
  frontText: string;
  backText: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ frontText, backText }) => {
  const flip = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spinVal}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(flip.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spinVal}deg` }],
    };
  });

  const handleFlip = () => {
    flip.value = withSpring(flip.value ? 0 : 1, {
      damping: 12,
      stiffness: 100,
    });
  };

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      <Animated.View
        style={[styles.card, styles.cardFront, frontAnimatedStyle]}
      >
        <Text style={styles.text}>{frontText}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <Text style={styles.text}>{backText}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  cardFront: {
    backgroundColor: Colors.surface,
  },
  cardBack: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 22,
    color: Colors.text.dark,
    fontFamily: "Nunito",
    textAlign: "center",
  },
});
