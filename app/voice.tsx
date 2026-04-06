import { Stack } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../components/BouncyButton";
import { SoundWave } from "../components/SoundWave";
import { SparkyMascot } from "../components/SparkyMascot";
import { Colors } from "../constants/colors";
import { generateVoiceExplanation } from "../services/openai";

export default function VoiceTutorScreen() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Make sure speech stops if they close the screen!
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleGenerate = async () => {
    if (topic.trim().length < 3) return;

    // Stop any current speech
    Speech.stop();
    setIsSpeaking(false);
    setLoading(true);
    setTranscript("");

    try {
      const data = await generateVoiceExplanation(topic);
      setTranscript(data.transcript);
      startSpeaking(data.transcript);
    } catch (error) {
      alert("Sparky lost his voice! Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const startSpeaking = (text: string) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 1.1, // Slightly slower than default for better learning
      pitch: 1.4, // Slightly higher pitch to sound friendly
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
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

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: "Voice Tutor", headerBackTitle: "Back" }}
      />

      {/* Top Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="What do you want me to explain?"
          placeholderTextColor={Colors.text.muted}
          value={topic}
          onChangeText={setTopic}
          onSubmitEditing={handleGenerate}
        />
        <BouncyButton
          title={loading ? "Thinking..." : "Explain it to me 🎙️"}
          onPress={handleGenerate}
          style={{ width: "100%" }}
        />
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.contentArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.statusText}>Writing a script...</Text>
          </View>
        ) : transcript ? (
          <View style={styles.playerContainer}>
            <SparkyMascot size={80} />
            <SoundWave isSpeaking={isSpeaking} />

            <TouchableOpacity
              onPress={togglePlayback}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>
                {isSpeaking ? "⏸️ Pause" : "▶️ Replay"}
              </Text>
            </TouchableOpacity>

            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptTitle}>Transcript</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <SparkyMascot size={150} />
            <Text
              style={[
                styles.statusText,
                { textAlign: "center", paddingHorizontal: 40 },
              ]}
            >
              Type a topic above, and I'll explain it out loud!
            </Text>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  input: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE8FF",
  },
  contentArea: { flexGrow: 1, padding: 24 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  statusText: { fontSize: 18, color: Colors.text.muted, marginTop: 20 },
  playerContainer: { alignItems: "center", marginTop: 20 },
  playButton: {
    backgroundColor: "#EAE8FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  playButtonText: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
  transcriptBox: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    width: "100%",
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text.muted,
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
  transcriptText: { fontSize: 18, color: Colors.text.dark, lineHeight: 28 },
});
