import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkyMascot } from "../../components/SparkyMascot";
import { Colors } from "../../constants/colors";
import { useStudyStore } from "../../stores/useStudyStore";

export default function LibraryScreen() {
  // Pull the saved decks from our global store
  const { savedDecks } = useStudyStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time search filtering
  const filteredDecks = savedDecks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library 📚</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved decks..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {savedDecks.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <SparkyMascot size={120} />
            <Text style={styles.emptyTitle}>It's quiet in here...</Text>
            <Text style={styles.emptySubtitle}>
              Generate some magic flashcard decks and save them to build your
              vault!
            </Text>
          </View>
        ) : filteredDecks.length === 0 ? (
          /* No Search Results */
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matches found</Text>
          </View>
        ) : (
          /* Saved Decks List */
          filteredDecks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckCard}
              activeOpacity={0.7}
            >
              <View style={styles.deckInfo}>
                <Text style={styles.deckTitle}>{deck.title}</Text>
                <Text style={styles.deckCount}>
                  {deck.cards.length} Cards • Created recently
                </Text>
              </View>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶️</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: Colors.text.dark },
  searchContainer: { paddingHorizontal: 24, paddingBottom: 20 },
  searchInput: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 16,
    color: Colors.text.dark,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  deckCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  deckInfo: { flex: 1 },
  deckTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 6,
  },
  deckCount: { fontSize: 14, color: Colors.text.muted, fontWeight: "500" },
  playButton: {
    backgroundColor: "#F0EFFF",
    padding: 12,
    borderRadius: 16,
    marginLeft: 16,
  },
  playIcon: { fontSize: 16 },
});
