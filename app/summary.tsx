import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../components/SparkyMascot";
import { Colors } from "../constants/colors";
import { generateSummary } from "../services/openai";

// Define what our AI response looks like based on our prompt
interface SummaryData {
  tldr: string;
  keyPoints: string[];
  keyTerms: { term: string; definition: string }[];
  funFact: string;
}

export default function SummaryScreen() {
  const { text } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await generateSummary(text as string);
        setSummary(result);
      } catch (err) {
        setError(
          "Sparky had trouble connecting to the AI brain. Check your API key and connection!",
        );
      } finally {
        setLoading(false);
      }
    };

    if (text) fetchSummary();
  }, [text]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (summary) {
        const textToRead = `Here's the summary: ${summary.tldr}. Key points are: ${summary.keyPoints.join(". ")}.`;
        Speech.speak(textToRead, {
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
        setIsSpeaking(true);
      }
    }
  };

  // Cleanup speech if user leaves screen
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={120} />
        <Text style={styles.loadingText}>Sparky is reading your notes...</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: "Your Summary", headerBackTitle: "Back" }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TL;DR Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>TL;DR ⚡</Text>
            <TouchableOpacity onPress={toggleSpeech} style={styles.speechBtn}>
              <Text style={styles.speechBtnText}>
                {isSpeaking ? "🛑 Stop" : "🔊 Read"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bodyText}>{summary.tldr}</Text>
        </View>

        {/* Key Points */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Points 🎯</Text>
          {summary.keyPoints.map((point, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bodyText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Key Terms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vocab Box 📚</Text>
          {summary.keyTerms.map((item, index) => (
            <View key={index} style={styles.termBox}>
              <Text style={styles.termTitle}>{item.term}</Text>
              <Text style={styles.termDef}>{item.definition}</Text>
            </View>
          ))}
        </View>

        {/* Fun Fact */}
        <View style={[styles.card, { backgroundColor: "#FFF0F5" }]}>
          <Text style={styles.cardTitle}>Did You Know? 🤔</Text>
          <Text style={styles.bodyText}>{summary.funFact}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text.dark,
    marginTop: 20,
    fontWeight: "bold",
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backBtn: { padding: 12, backgroundColor: Colors.primary, borderRadius: 12 },
  backBtnText: { color: Colors.surface, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 10,
  },
  bodyText: { fontSize: 16, color: Colors.text.dark, lineHeight: 24 },
  speechBtn: {
    backgroundColor: "#F0EFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speechBtnText: { color: Colors.primary, fontWeight: "bold" },
  bulletRow: { flexDirection: "row", marginBottom: 12, paddingRight: 10 },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginTop: 8,
    marginRight: 12,
  },
  termBox: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  termDef: { fontSize: 14, color: Colors.text.dark },
});
