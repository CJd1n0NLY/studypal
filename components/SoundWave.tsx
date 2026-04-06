import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";

export const SoundWave = ({ isSpeaking }: { isSpeaking: boolean }) => {
  // Create 5 bars for our waveform
  const bars = [0, 1, 2, 3, 4].map(() => useSharedValue(10));

  useEffect(() => {
    if (isSpeaking) {
      // Start the bouncing animation for each bar with random delays and heights
      bars.forEach((bar, index) => {
        bar.value = withDelay(
          index * 100,
          withRepeat(
            withSequence(
              withTiming(Math.random() * 40 + 20, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(10, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
              }),
            ),
            -1, // infinite
            true, // reverse
          ),
        );
      });
    } else {
      // Stop and shrink back to default
      bars.forEach((bar) => {
        bar.value = withTiming(10, { duration: 300 });
      });
    }
  }, [isSpeaking]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          height: bar.value,
        }));
        return (
          <Animated.View key={index} style={[styles.bar, animatedStyle]} />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    gap: 8,
  },
  bar: {
    width: 12,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
});
