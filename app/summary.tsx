import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../components/SparkyMascot";
import { useToast } from "../components/ToastNotification";
import { Colors } from "../constants/colors";
import { generateSummary } from "../services/openai";
import { playSound } from "../services/soundManager";

interface SummaryData {
  tldr: string;
  keyPoints: string[];
  keyTerms: { term: string; definition: string }[];
  funFact: string;
}

// Animated card that fades/slides in
const AnimCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: any;
}> = ({ children, delay = 0, style }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={style}>
    {children}
  </Animated.View>
);

export default function SummaryScreen() {
  const { text } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set());

  const speechScale = useSharedValue(1);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        await playSound("thinking");
        const result = await generateSummary(text as string);
        setSummary(result);
        showToast({
          message: "Summary ready! ⚡",
          type: "success",
          duration: 2000,
        });
      } catch {
        setError(
          "Sparky had trouble connecting. Check your API key and connection!",
        );
        showToast({ message: "Failed to generate summary.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    if (text) fetchSummary();
  }, [text]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      speechScale.value = withSpring(1);
    } else if (summary) {
      const textToRead = `Here's the summary. ${summary.tldr}. Key points are: ${summary.keyPoints.join(". ")}.`;
      Speech.speak(textToRead, {
        pitch: 1.1,
        rate: 1.0,
        onDone: () => {
          setIsSpeaking(false);
          speechScale.value = withSpring(1);
        },
        onStopped: () => {
          setIsSpeaking(false);
          speechScale.value = withSpring(1);
        },
      });
      setIsSpeaking(true);
      speechScale.value = withSpring(1.1, { damping: 6 });
    }
  };

  const toggleTerm = (idx: number) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const speechBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speechScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={130} mood="thinking" />
        <Text style={styles.loadingText}>Sparky is reading your notes...</Text>
        <View style={styles.shimmerRow}>
          {[100, 80, 90, 70].map((w, i) => (
            <View key={i} style={[styles.shimmerLine, { width: `${w}%` }]} />
          ))}
        </View>
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={120} mood="sad" />
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TL;DR */}
        <AnimCard delay={0}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View
                  style={[styles.cardDot, { backgroundColor: Colors.primary }]}
                />
                <Text style={styles.cardTitle}>TL;DR ⚡</Text>
              </View>
              <Animated.View style={speechBtnStyle}>
                <TouchableOpacity
                  onPress={toggleSpeech}
                  style={[
                    styles.speechBtn,
                    isSpeaking && styles.speechBtnActive,
                  ]}
                >
                  <Text style={styles.speechBtnText}>
                    {isSpeaking ? "🛑 Stop" : "🔊 Read"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <Text style={styles.bodyText}>{summary.tldr}</Text>
          </View>
        </AnimCard>

        {/* Key Points */}
        <AnimCard delay={150}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View
                style={[styles.cardDot, { backgroundColor: Colors.accent }]}
              />
              <Text style={styles.cardTitle}>Key Points 🎯</Text>
            </View>
            {summary.keyPoints.map((point, i) => (
              <View key={i} style={styles.bulletRow}>
                <View
                  style={[
                    styles.bulletNum,
                    { backgroundColor: Colors.accent + "22" },
                  ]}
                >
                  <Text
                    style={[styles.bulletNumText, { color: Colors.accent }]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.bodyText, { flex: 1 }]}>{point}</Text>
              </View>
            ))}
          </View>
        </AnimCard>

        {/* Key Terms — expandable */}
        <AnimCard delay={300}>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View
                style={[styles.cardDot, { backgroundColor: Colors.secondary }]}
              />
              <Text style={styles.cardTitle}>Vocab Box 📚</Text>
            </View>
            {summary.keyTerms.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.termBox,
                  expandedTerms.has(i) && styles.termBoxExpanded,
                ]}
                onPress={() => toggleTerm(i)}
                activeOpacity={0.75}
              >
                <View style={styles.termHeader}>
                  <Text style={styles.termTitle}>{item.term}</Text>
                  <Text style={styles.termArrow}>
                    {expandedTerms.has(i) ? "▾" : "▸"}
                  </Text>
                </View>
                {expandedTerms.has(i) && (
                  <Text style={styles.termDef}>{item.definition}</Text>
                )}
              </TouchableOpacity>
            ))}
            <Text style={styles.tapHint}>
              Tap a term to expand its definition
            </Text>
          </View>
        </AnimCard>

        {/* Fun Fact */}
        <AnimCard delay={450}>
          <View style={[styles.card, styles.funFactCard]}>
            <Text style={styles.funFactEmoji}>🤔</Text>
            <Text style={[styles.cardTitle, { color: Colors.secondary }]}>
              Did You Know?
            </Text>
            <Text style={[styles.bodyText, { color: "#5C2B3B" }]}>
              {summary.funFact}
            </Text>
          </View>
        </AnimCard>

        {/* Action row */}
        <AnimCard delay={550}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EAE8FF" }]}
              onPress={() => router.push({ pathname: "/flashcards" })}
            >
              <Text style={styles.actionBtnIcon}>🃏</Text>
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>
                Flashcards
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#FFF3E0" }]}
              onPress={() => router.push({ pathname: "/quiz" })}
            >
              <Text style={styles.actionBtnIcon}>🧩</Text>
              <Text style={[styles.actionBtnText, { color: Colors.warning }]}>
                Quiz Me
              </Text>
            </TouchableOpacity>
          </View>
        </AnimCard>
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
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text.dark,
    marginTop: 20,
    fontWeight: "bold",
  },
  shimmerRow: { width: "100%", marginTop: 32, gap: 10 },
  shimmerLine: {
    height: 14,
    backgroundColor: "#EAE8FF",
    borderRadius: 7,
    alignSelf: "flex-start",
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  backBtn: { padding: 14, backgroundColor: Colors.primary, borderRadius: 16 },
  backBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  cardDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 19, fontWeight: "bold", color: Colors.text.dark },
  bodyText: { fontSize: 16, color: Colors.text.dark, lineHeight: 25 },
  speechBtn: {
    backgroundColor: "#F0EFFF",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  speechBtnActive: { backgroundColor: "#FFE5EC" },
  speechBtnText: { color: Colors.primary, fontWeight: "bold", fontSize: 14 },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  bulletNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bulletNumText: { fontSize: 12, fontWeight: "800" },
  termBox: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  termBoxExpanded: {
    borderColor: Colors.secondary + "55",
    backgroundColor: "#FFF5F8",
  },
  termHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  termTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
  },
  termArrow: { fontSize: 16, color: Colors.text.muted },
  termDef: {
    fontSize: 14,
    color: Colors.text.dark,
    marginTop: 8,
    lineHeight: 20,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: "center",
  },
  funFactCard: { backgroundColor: "#FFF0F5" },
  funFactEmoji: { fontSize: 32, marginBottom: 8 },
  actionRow: { flexDirection: "row", gap: 14, marginBottom: 10 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    gap: 8,
  },
  actionBtnIcon: { fontSize: 28 },
  actionBtnText: { fontWeight: "bold", fontSize: 15 },
});
