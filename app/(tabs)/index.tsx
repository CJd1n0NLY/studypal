import { useRouter } from "expo-router";
import React, { useEffect } from "react";
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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../../components/SparkyMascot";
import { Colors } from "../../constants/colors";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";
import { useStudyStore } from "../../stores/useStudyStore";
import { useUserStore } from "../../stores/useUserStore";

// Pulsing action card
const ActionCard = ({
  title,
  icon,
  color,
  description,
  onPress,
  delay = 0,
}: {
  title: string;
  icon: string;
  color: string;
  description: string;
  onPress: () => void;
  delay?: number;
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800 }),
        withTiming(0.4, { duration: 1800 }),
      ),
      -1,
      true,
    );
  }, []);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.93, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
    onPress();
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: color,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={{ width: "48%" }}
    >
      <Animated.View
        style={[styles.cardGlow, glowStyle, { shadowColor: color }]}
      />
      <TouchableOpacity
        style={[styles.actionCard, { borderBottomColor: color }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Animated.View style={cardStyle}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <Text style={styles.cardText}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Floating blob background
const FloatingBlob = ({
  color,
  size,
  top,
  left,
  delay,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delay: number;
}) => {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 3000 + delay }),
        withTiming(0, { duration: 3000 + delay }),
      ),
      -1,
      true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.View
      style={[
        styles.blob,
        { backgroundColor: color, width: size, height: size, top, left },
        style,
      ]}
    />
  );
};

export default function HomeDashboard() {
  const router = useRouter();
  const { streak, minutesStudiedToday, dailyGoalMinutes } = useStudyStore();
  const { name } = useUserStore();
  const isOffline = useOfflineStatus();
  const progress = Math.min(
    (minutesStudiedToday / dailyGoalMinutes) * 100,
    100,
  );

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating background blobs */}
      <FloatingBlob
        color="#6C63FF18"
        size={180}
        top={-30}
        left={-50}
        delay={0}
      />
      <FloatingBlob
        color="#FF658418"
        size={140}
        top={80}
        left={240}
        delay={800}
      />
      <FloatingBlob
        color="#43E97B12"
        size={100}
        top={300}
        left={-20}
        delay={400}
      />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Offline — AI features are disabled
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greetingSmall}>{greeting},</Text>
            <Text style={styles.greeting}>{name || "Learner"}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to study smarter?</Text>
          </View>
          <View style={styles.headerRight}>
            <SparkyMascot size={80} mood="happy" />
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} day streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* Daily Goal Progress */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.cardTitle}>📅 Daily Goal</Text>
              <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
            </View>
            <Text style={styles.progressSub}>
              {minutesStudiedToday} / {dailyGoalMinutes} minutes today
            </Text>
            <View style={styles.progressBarBg}>
              <Animated.View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
            <View style={styles.milestones}>
              {[25, 50, 75, 100].map((m) => (
                <View key={m} style={[styles.milestone, { left: `${m}%` }]}>
                  <View
                    style={[
                      styles.milestoneDot,
                      progress >= m && { backgroundColor: Colors.accent },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{ width: "48%", marginBottom: 16 }}
        >
          <Text style={styles.sectionTitle}>What do you want to do?</Text>
        </Animated.View>

        <View style={styles.grid}>
          <ActionCard
            title="Summarize"
            icon="✨"
            description="Turn notes into key points"
            color={Colors.primary}
            onPress={() => router.push("/(tabs)/input")}
            delay={200}
          />
          <ActionCard
            title="Flashcards"
            icon="🃏"
            description="Flip & learn"
            color={Colors.secondary}
            onPress={() => router.push("/flashcards")}
            delay={300}
          />
          <ActionCard
            title="Quiz Mode"
            icon="🧩"
            description="Test your knowledge"
            color={Colors.warning}
            onPress={() => router.push("/quiz")}
            delay={400}
          />
          <ActionCard
            title="Voice Tutor"
            icon="🎙️"
            description="Listen & learn"
            color={Colors.accent}
            onPress={() => router.push("/voice")}
            delay={500}
          />
        </View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📚</Text>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMid]}>
              <Text style={styles.statEmoji}>🃏</Text>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>Cards Learned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={styles.statValue}>87%</Text>
              <Text style={styles.statLabel}>Quiz Avg.</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  blob: { position: "absolute", borderRadius: 999, zIndex: 0 },
  offlineBanner: {
    backgroundColor: Colors.error,
    padding: 10,
    alignItems: "center",
    zIndex: 10,
  },
  offlineText: { color: "white", fontWeight: "bold", fontSize: 13 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "center", gap: 8 },
  greetingSmall: { fontSize: 14, color: Colors.text.muted, fontWeight: "500" },
  greeting: { fontSize: 28, fontWeight: "900", color: Colors.text.dark },
  subGreeting: { fontSize: 15, color: Colors.text.muted, marginTop: 4 },
  streakBadge: {
    backgroundColor: "#FFE5EC",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: { fontSize: 12, fontWeight: "bold", color: Colors.secondary },
  progressCard: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 24,
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text.dark },
  progressPct: { fontSize: 22, fontWeight: "900", color: Colors.accent },
  progressSub: { fontSize: 13, color: Colors.text.muted, marginBottom: 14 },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  milestones: { position: "relative", height: 8, marginTop: 2 },
  milestone: { position: "absolute", top: 0, transform: [{ translateX: -4 }] },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text.dark,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  cardGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 0,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 22,
    alignItems: "center",
    borderBottomWidth: 4,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: { fontSize: 34, marginBottom: 10 },
  cardText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.dark,
    marginBottom: 4,
  },
  cardDesc: { fontSize: 12, color: Colors.text.muted, textAlign: "center" },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardMid: {
    backgroundColor: "#EAE8FF",
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "900", color: Colors.text.dark },
  statLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
    textAlign: "center",
  },
});
