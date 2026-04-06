import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../../components/SparkyMascot";
import { Colors } from "../../constants/colors";
import { useStudyStore } from "../../stores/useStudyStore";

export default function HomeDashboard() {
  const router = useRouter();
  const { streak, minutesStudiedToday, dailyGoalMinutes } = useStudyStore();
  const progress = (minutesStudiedToday / dailyGoalMinutes) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Greeting & Sparky Placeholder */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey CJ! 👋</Text>
            <Text style={styles.subGreeting}>Ready to study smarter?</Text>
          </View>
          <SparkyMascot />
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Daily Goal</Text>
          <Text style={styles.progressText}>
            {minutesStudiedToday} / {dailyGoalMinutes} mins
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.grid}>
          <ActionCard
            title="Summarize"
            icon="✨"
            color={Colors.primary}
            onPress={() => router.push("/input")}
          />
          <ActionCard
            title="Flashcards"
            icon="🃏"
            color={Colors.secondary}
            onPress={() => router.push("/flashcards")}
          />
          <ActionCard
            title="Quiz Mode"
            icon="🧩"
            color={Colors.warning}
            onPress={() => router.push("/quiz")}
          />
          <ActionCard
            title="Voice Tutor"
            icon="🎙️"
            color={Colors.accent}
            onPress={() => router.push("/voice")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for Action Cards
const ActionCard = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity
    style={[
      styles.actionCard,
      { borderBottomColor: color, borderBottomWidth: 4 },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: { fontSize: 28, fontWeight: "bold", color: Colors.text.dark },
  subGreeting: { fontSize: 16, color: Colors.text.muted, marginTop: 4 },
  streakBadge: {
    backgroundColor: "#FFE5EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 16, fontWeight: "bold", color: Colors.secondary },
  progressCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 8,
  },
  progressText: { fontSize: 14, color: Colors.text.muted, marginBottom: 16 },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardText: { fontSize: 16, fontWeight: "600", color: Colors.text.dark },
});
