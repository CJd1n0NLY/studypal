import { Stack } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../components/BouncyButton";
import { SoundWave } from "../components/SoundWave";
import { SparkyMascot } from "../components/SparkyMascot";
import { useToast } from "../components/ToastNotification";
import { Colors } from "../constants/colors";
import { generateVoiceExplanation } from "../services/openai";
import { playSound, unloadAllSounds } from "../services/soundManager";

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0] as const;
type Speed = (typeof SPEEDS)[number];

// Best female voices per platform
// iOS: com.apple.ttsbundle.Samantha-compact, Nicky, Karen, Moira, Tessa
// Android: en-us-x-sfg (Google US English Female), or fallback
const FEMALE_VOICE_NAMES = [
  "Samantha", // macOS/iOS default
  "Nicky", // iOS
  "Karen", // iOS
  "Moira", // iOS
  "Tessa", // iOS
  "en-us-x-sfg", // Android Google
  "en-GB-language", // Android fallback
  "Zira", // Windows US Female
  "Hazel", // Windows UK Female
  "Catherine", // Windows AU Female
  "Female", // Catch-all for generic web voices (e.g., "Google US English Female")
];

async function getBestFemaleVoice(): Promise<Speech.Voice | null> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Prefer en-US voices, scored by matching female names
    const candidates = voices.filter(
      (v) =>
        v.language.startsWith("en") &&
        (v.quality === Speech.VoiceQuality.Enhanced ||
          v.quality === Speech.VoiceQuality.Default),
    );
    for (const name of FEMALE_VOICE_NAMES) {
      const match = candidates.find(
        (v) =>
          v.name.toLowerCase().includes(name.toLowerCase()) ||
          v.identifier.toLowerCase().includes(name.toLowerCase()),
      );
      if (match) return match;
    }
    // Fallback: first English voice
    return candidates[0] ?? null;
  } catch {
    return null;
  }
}

export default function VoiceTutorScreen() {
  const { showToast } = useToast();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<Speech.Voice | null>(null);

  const mascotOpacity = useSharedValue(0);
  const playerY = useSharedValue(40);

  // Init: find best female voice
  useEffect(() => {
    getBestFemaleVoice().then((v) => {
      setSelectedVoice(v);
    });
    return () => {
      Speech.stop();
    };
  }, []);

  // Animate player in when transcript appears
  useEffect(() => {
    if (transcript) {
      mascotOpacity.value = withTiming(1, { duration: 500 });
      playerY.value = withSpring(0, { damping: 14 });
    } else {
      mascotOpacity.value = withTiming(0, { duration: 300 });
      playerY.value = withTiming(40, { duration: 300 });
    }
  }, [transcript]);

  const mascotAnimStyle = useAnimatedStyle(() => ({
    opacity: mascotOpacity.value,
  }));
  const playerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playerY.value }],
    opacity: mascotOpacity.value,
  }));

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      showToast({
        message: "Enter a topic to explain!",
        type: "warning",
        emoji: "🎙️",
      });
      return;
    }
    Speech.stop();
    setIsSpeaking(false);
    setLoading(true);
    setTranscript("");

    try {
      await playSound("thinking");
      const data = await generateVoiceExplanation(topic);
      await unloadAllSounds();
      setTranscript(data.transcript);
      showToast({
        message: "Ready! Playing explanation 🎶",
        type: "success",
        emoji: "✨",
      });
      startSpeaking(data.transcript);
    } catch {
      showToast({
        message: "Sparky lost her voice! Check your connection.",
        type: "error",
        emoji: "😅",
      });
    } finally {
      setLoading(false);
    }
  };

  const startSpeaking = (text: string, overrideSpeed?: number) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      voice: selectedVoice?.identifier,
      rate: overrideSpeed ?? speed, // <--- Use override if provided
      pitch: 1.15,
      language: "en-US",
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        showToast({ message: "Playback error. Tap replay.", type: "error" });
      },
    });
  };

  const togglePlayback = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      startSpeaking(transcript);
    }
  };

  const handleSpeedChange = (s: Speed) => {
    setSpeed(s);
    if (isSpeaking) {
      Speech.stop();
      // Pass the new speed 's' directly into startSpeaking
      setTimeout(() => startSpeaking(transcript, s), 100);
    }
    showToast({ message: `Speed set to ${s}×`, type: "info", duration: 1500 });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: "Voice Tutor", headerBackTitle: "Back" }}
      />

      {/* Input card */}
      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="What should I explain for you?"
            placeholderTextColor={Colors.text.muted}
            value={topic}
            onChangeText={setTopic}
            onSubmitEditing={handleGenerate}
            returnKeyType="go"
          />
        </View>
        <BouncyButton
          title={loading ? "Thinking..." : "Explain It 🎙️"}
          onPress={handleGenerate}
          style={{ width: "100%" }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <SparkyMascot size={140} mood="thinking" />
            <Text style={styles.statusText}>
              Writing a script just for you...
            </Text>
          </View>
        ) : transcript ? (
          <Animated.View style={[styles.playerContainer, playerAnimStyle]}>
            {/* Mascot speaking animation */}
            <Animated.View style={mascotAnimStyle}>
              <SparkyMascot
                size={100}
                mood={isSpeaking ? "speaking" : "happy"}
              />
            </Animated.View>

            {/* Sound wave */}
            <View style={styles.waveContainer}>
              <SoundWave
                isSpeaking={isSpeaking}
                color={isSpeaking ? Colors.secondary : Colors.primary}
              />
            </View>

            {/* Play/pause button */}
            <TouchableOpacity
              onPress={togglePlayback}
              style={[styles.playButton, isSpeaking && styles.playButtonActive]}
            >
              <Text style={styles.playButtonText}>
                {isSpeaking ? "⏸ Pause" : "▶ Replay"}
              </Text>
            </TouchableOpacity>

            {/* Speed selector */}
            <View style={styles.speedRow}>
              <Text style={styles.speedLabel}>Speed:</Text>
              {SPEEDS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => handleSpeedChange(s)}
                  style={[
                    styles.speedBtn,
                    speed === s && styles.speedBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.speedBtnText,
                      speed === s && styles.speedBtnTextActive,
                    ]}
                  >
                    {s}×
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Voice info pill */}
            {selectedVoice && (
              <View style={styles.voicePill}>
                <Text style={styles.voicePillText}>
                  👩‍🏫 {selectedVoice.name} · {selectedVoice.language}
                </Text>
              </View>
            )}

            {/* Transcript */}
            <View style={styles.transcriptBox}>
              <View style={styles.transcriptHeader}>
                <Text style={styles.transcriptTitle}>📄 Transcript</Text>
                <View style={styles.livePill}>
                  <View
                    style={[styles.liveDot, isSpeaking && styles.liveDotActive]}
                  />
                  <Text style={styles.liveText}>
                    {isSpeaking ? "PLAYING" : "PAUSED"}
                  </Text>
                </View>
              </View>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.centerContainer}>
            <SparkyMascot size={160} mood="default" />
            <Text style={styles.statusText}>
              Hi! I'm your voice tutor 👩‍🏫{"\n"}Type a topic and I'll explain it!
            </Text>
            <View style={styles.exampleChips}>
              {[
                "Photosynthesis",
                "Machine Learning",
                "World War II",
                "Algebra",
              ].map((ex) => (
                <TouchableOpacity
                  key={ex}
                  style={styles.chip}
                  onPress={() => setTopic(ex)}
                >
                  <Text style={styles.chipText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inputSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  inputRow: { marginBottom: 14 },
  input: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 18,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
    color: Colors.text.dark,
  },
  contentArea: { flexGrow: 1, padding: 24 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  statusText: {
    fontSize: 18,
    color: Colors.text.muted,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 28,
  },
  playerContainer: { alignItems: "center" },
  waveContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 12,
  },
  playButton: {
    backgroundColor: "#EAE8FF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 16,
    marginBottom: 20,
    minWidth: 160,
    alignItems: "center",
  },
  playButtonActive: { backgroundColor: "#FFE8EF" },
  playButtonText: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
  speedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  speedLabel: { fontSize: 14, color: Colors.text.muted, fontWeight: "600" },
  speedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
  },
  speedBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  speedBtnText: { fontSize: 13, fontWeight: "700", color: Colors.text.muted },
  speedBtnTextActive: { color: "white" },
  voicePill: {
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFD6E7",
  },
  voicePillText: { fontSize: 12, color: Colors.secondary, fontWeight: "600" },
  transcriptBox: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 24,
    width: "100%",
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  transcriptTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text.muted,
    letterSpacing: 0.5,
  },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#ccc" },
  liveDotActive: { backgroundColor: Colors.success },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.text.muted,
    letterSpacing: 1,
  },
  transcriptText: { fontSize: 17, color: Colors.text.dark, lineHeight: 28 },
  exampleChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 24,
  },
  chip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
  },
  chipText: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
});
