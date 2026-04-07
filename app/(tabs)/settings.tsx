import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../../components/BouncyButton";
import { SparkyMascot } from "../../components/SparkyMascot";
import { useToast } from "../../components/ToastNotification";
import { Colors } from "../../constants/colors";
import { playSound } from "../../services/soundManager";
import { useStudyStore } from "../../stores/useStudyStore";
import { useUserStore } from "../../stores/useUserStore";

const DAILY_GOAL_OPTIONS = [15, 30, 45, 60, 90];

export default function SettingsScreen() {
  const { name, setName, offlineMode, toggleOfflineMode } = useUserStore();
  const { dailyGoalMinutes, setDailyGoal } = useStudyStore();
  const { showToast } = useToast();

  const [editName, setEditName] = useState(name);
  const [notifications, setNotifications] = useState(true);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const handleSaveProfile = async () => {
    if (editName.trim().length === 0) {
      showToast({
        message: "Name can't be empty!",
        type: "warning",
        emoji: "✏️",
      });
      return;
    }
    playSound("correct").catch(() => {});
    setName(editName.trim());
    showToast({
      message: "Profile saved! Looking good ✨",
      type: "success",
      emoji: "👤",
    });
  };

  const handleNotificationsToggle = (val: boolean) => {
    setNotifications(val);
    showToast({
      message: val ? "Daily reminders enabled! 🔔" : "Reminders turned off",
      type: val ? "success" : "info",
    });
  };

  const handleOfflineToggle = (val: boolean) => {
    toggleOfflineMode();
    showToast({
      message: val
        ? "Offline mode ON — AI disabled"
        : "Back online! AI ready 🤖",
      type: val ? "warning" : "success",
    });
  };

  const handleGoalChange = (mins: number) => {
    setDailyGoal?.(mins);
    setShowGoalPicker(false);
    showToast({
      message: `Daily goal set to ${mins} minutes!`,
      type: "success",
      emoji: "🎯",
    });
  };

  const handleClearCache = () => {
    // Use native Alert for destructive confirmations only — this is intentional UX
    Alert.alert(
      "Clear Cache",
      "This will free up space but won't delete your saved decks.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear It",
          style: "destructive",
          onPress: () => {
            playSound("next_previous").catch(() => {});
            showToast({
              message: "Cache cleared! Fresh start 🧹",
              type: "success",
              emoji: "✅",
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <SparkyMascot size={72} mood="happy" />
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Customize your experience</Text>
        </View>

        {/* Profile */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="What should Sparky call you?"
            placeholderTextColor={Colors.text.muted}
          />

          <Text style={styles.label}>Daily Study Goal</Text>
          <TouchableOpacity
            style={styles.goalSelector}
            onPress={() => setShowGoalPicker(!showGoalPicker)}
          >
            <Text style={styles.goalValue}>{dailyGoalMinutes} minutes</Text>
            <Text style={styles.goalArrow}>{showGoalPicker ? "▾" : "▸"}</Text>
          </TouchableOpacity>

          {showGoalPicker && (
            <View style={styles.goalOptions}>
              {DAILY_GOAL_OPTIONS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.goalOption,
                    dailyGoalMinutes === mins && styles.goalOptionActive,
                  ]}
                  onPress={() => handleGoalChange(mins)}
                >
                  <Text
                    style={[
                      styles.goalOptionText,
                      dailyGoalMinutes === mins && styles.goalOptionTextActive,
                    ]}
                  >
                    {mins} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <BouncyButton
            title="Save Profile"
            onPress={handleSaveProfile}
            style={{ marginTop: 16, paddingVertical: 14 }}
          />
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>⚙️</Text>
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <SettingRow
            title="Daily Reminders"
            subtitle="Sparky will nudge you to study"
            value={notifications}
            onToggle={handleNotificationsToggle}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Offline Mode"
            subtitle="Disable AI features to save data"
            value={offlineMode ?? false}
            onToggle={handleOfflineToggle}
          />
        </View>

        {/* System */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>📱</Text>
            <Text style={styles.sectionTitle}>System</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Provider</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>v1.0.0</Text>
          </View>

          <BouncyButton
            title="🧹 Clear App Cache"
            type="outline"
            onPress={handleClearCache}
            style={{ marginTop: 20, borderColor: Colors.error }}
            textStyle={{ color: Colors.error, fontSize: 15 }}
          />
        </View>

        {/* About */}
        <View style={styles.aboutBox}>
          <SparkyMascot size={50} mood="happy" />
          <Text style={styles.aboutText}>Made with ⚡ by StudyPal</Text>
          <Text style={styles.aboutSub}>
            Powered by OpenAI · Built with Expo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingRow: React.FC<{
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}> = ({ title, subtitle, value, onToggle }) => (
  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#E0E0E0", true: Colors.accent }}
      thumbColor={value ? "white" : "#f0f0f0"}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 60 },
  profileHeader: { alignItems: "center", marginBottom: 28 },
  avatarCircle: {
    width: 110,
    height: 110,
    backgroundColor: Colors.surface,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: "900", color: Colors.text.dark },
  headerSub: { fontSize: 14, color: Colors.text.muted, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text.dark },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    color: Colors.text.dark,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
  },
  goalSelector: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
    marginBottom: 8,
  },
  goalValue: { fontSize: 16, fontWeight: "600", color: Colors.primary },
  goalArrow: { fontSize: 16, color: Colors.text.muted },
  goalOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  goalOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
  },
  goalOptionActive: { backgroundColor: Colors.primary },
  goalOptionText: { fontSize: 14, fontWeight: "600", color: Colors.text.muted },
  goalOptionTextActive: { color: "white" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.dark,
    marginBottom: 3,
  },
  rowSubtitle: { fontSize: 13, color: Colors.text.muted },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: { fontSize: 15, fontWeight: "600", color: Colors.text.dark },
  infoValue: { fontSize: 14, color: Colors.text.muted },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: { fontSize: 13, fontWeight: "700", color: Colors.success },
  aboutBox: {
    alignItems: "center",
    gap: 6,
    padding: 20,
    marginTop: 4,
  },
  aboutText: { fontSize: 14, fontWeight: "600", color: Colors.text.muted },
  aboutSub: { fontSize: 12, color: Colors.text.muted, opacity: 0.7 },
});
