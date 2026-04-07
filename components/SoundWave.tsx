import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/colors";

interface SoundWaveProps {
  isSpeaking: boolean;
  color?: string;
}

// Each bar has its own phase offset for a ripple effect
const BAR_CONFIGS = [
  { height: 14, delay: 0 },
  { height: 22, delay: 80 },
  { height: 34, delay: 160 },
  { height: 46, delay: 240 },
  { height: 54, delay: 300 },
  { height: 60, delay: 340 },
  { height: 54, delay: 300 },
  { height: 46, delay: 240 },
  { height: 34, delay: 160 },
  { height: 22, delay: 80 },
  { height: 14, delay: 0 },
];

const WaveBar: React.FC<{
  maxHeight: number;
  delay: number;
  isSpeaking: boolean;
  color: string;
}> = ({ maxHeight, delay, isSpeaking, color }) => {
  const scaleY = useSharedValue(0.15);

  useEffect(() => {
    if (isSpeaking) {
      scaleY.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 400 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.15 + Math.random() * 0.2, {
            duration: 400 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    } else {
      scaleY.value = withTiming(0.15, { duration: 600 });
    }
  }, [isSpeaking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: maxHeight,
          backgroundColor: color,
          borderRadius: maxHeight / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const SoundWave: React.FC<SoundWaveProps> = ({
  isSpeaking,
  color = Colors.primary,
}) => {
  return (
    <View style={styles.container}>
      {BAR_CONFIGS.map((cfg, i) => (
        <WaveBar
          key={i}
          maxHeight={cfg.height}
          delay={cfg.delay}
          isSpeaking={isSpeaking}
          color={color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 70,
    paddingHorizontal: 16,
  },
  bar: {
    width: 6,
  },
});
