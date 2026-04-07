import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeOutRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../../components/SparkyMascot";
import { useToast } from "../../components/ToastNotification";
import { Colors } from "../../constants/colors";
import { playSound } from "../../services/soundManager";
import { useStudyStore } from "../../stores/useStudyStore";

const SUBJECT_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.warning,
  "#9b59b6",
  "#00BCD4",
];

export default function LibraryScreen() {
  const { savedDecks, removeDeck } = useStudyStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "recent">("all");

  const filteredDecks = savedDecks.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: string, title: string) => {
    await playSound("wrong");
    removeDeck?.(id);
    showToast({
      message: `"${title}" removed from library`,
      type: "info",
      emoji: "🗑️",
    });
  };

  const handlePlay = (deck: (typeof savedDecks)[number]) => {
    // Navigate to flashcards screen, passing the saved deck id so it loads directly
    router.push({ pathname: "/flashcards", params: { deckId: deck.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library 📚</Text>
        <Text style={styles.headerSub}>
          {savedDecks.length} deck{savedDecks.length !== 1 ? "s" : ""} saved
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved decks..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {savedDecks.length === 0 ? (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.emptyState}
          >
            <SparkyMascot size={130} mood="sad" />
            <Text style={styles.emptyTitle}>It's quiet in here...</Text>
            <Text style={styles.emptySubtitle}>
              Generate some magic flashcard decks and save them to build your
              vault!
            </Text>
          </Animated.View>
        ) : filteredDecks.length === 0 ? (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.emptyState}
          >
            <SparkyMascot size={110} mood="thinking" />
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term.
            </Text>
          </Animated.View>
        ) : (
          filteredDecks.map((deck, idx) => (
            <Animated.View
              key={deck.id}
              entering={FadeInDown.delay(idx * 60).springify()}
              exiting={FadeOutRight}
            >
              <TouchableOpacity style={styles.deckCard} activeOpacity={0.8}>
                <View
                  style={[
                    styles.deckColorBar,
                    {
                      backgroundColor:
                        SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
                    },
                  ]}
                />
                <View style={styles.deckInfo}>
                  <Text style={styles.deckTitle} numberOfLines={1}>
                    {deck.title}
                  </Text>
                  <Text style={styles.deckCount}>
                    🃏 {deck.cards.length} cards
                  </Text>
                </View>
                <View style={styles.deckActions}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handlePlay(deck)}
                  >
                    <Text style={styles.playIcon}>▶</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(deck.id, deck.title)}
                  >
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: Colors.text.dark },
  headerSub: { fontSize: 14, color: Colors.text.muted, marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.dark,
  },
  clearBtn: { fontSize: 16, color: Colors.text.muted, padding: 4 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text.dark },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.text.muted,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  deckCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  deckColorBar: { width: 6, alignSelf: "stretch" },
  deckInfo: { flex: 1, padding: 18 },
  deckTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 5,
  },
  deckCount: { fontSize: 13, color: Colors.text.muted, fontWeight: "500" },
  deckActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 14,
    gap: 8,
  },
  playButton: {
    backgroundColor: "#EAE8FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { fontSize: 14, color: Colors.primary },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: { fontSize: 14 },
});
