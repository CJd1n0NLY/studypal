import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../components/BouncyButton";
import { FlipCard } from "../components/FlipCard";
import { SparkyMascot } from "../components/SparkyMascot";
import { Colors } from "../constants/colors";
import { generateFlashcards } from "../services/openai";
import { useStudyStore } from "../stores/useStudyStore";

interface CardData {
  front: string;
  back: string;
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { saveDeck } = useStudyStore();
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (topic.trim().length < 3) return;
    setLoading(true);
    try {
      const deck = await generateFlashcards(topic);
      setCards(deck);
      setCurrentIndex(0);
      setIsSaved(false);
    } catch (error) {
      alert("Sparky couldn't generate the cards. Check your connection!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeck = () => {
    if (isSaved) return;

    // Add a unique ID to each card to satisfy the Zustand store requirements
    const formattedCards = cards.map((card, index) => ({
      id: `${Date.now()}-${index}`,
      front: card.front,
      back: card.back,
    }));

    saveDeck({
      id: Date.now().toString(),
      title: topic,
      cards: formattedCards,
      createdAt: new Date().toISOString(),
    });

    setIsSaved(true);
    alert("Deck saved to your Library! 📚");
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("You finished the deck! 🎉");
      setCards([]); // Reset to make a new deck
      setTopic("");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: "Flashcard Studio", headerBackTitle: "Back" }}
      />

      {/* State 1: Input Topic */}
      {cards.length === 0 && !loading && (
        <View style={styles.inputContainer}>
          <SparkyMascot size={100} />
          <Text style={styles.title}>What are we studying?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Philippine History, YOLO Object Detection..."
            placeholderTextColor={Colors.text.muted}
            value={topic}
            onChangeText={setTopic}
            onSubmitEditing={handleGenerate}
          />
          <BouncyButton
            title="Generate Magic Deck ✨"
            onPress={handleGenerate}
          />
        </View>
      )}

      {/* State 2: Loading */}
      {loading && (
        <View style={styles.centerContainer}>
          <SparkyMascot size={120} />
          <Text style={styles.loadingText}>Crafting the perfect cards...</Text>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 20 }}
          />
        </View>
      )}

      {/* State 3: Viewing Cards */}
      {cards.length > 0 && !loading && (
        <View style={styles.deckContainer}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: isSaved ? Colors.success : "#EAE8FF",
              padding: 10,
              borderRadius: 12,
            }}
            onPress={handleSaveDeck}
          >
            <Text
              style={{
                color: isSaved ? "white" : Colors.primary,
                fontWeight: "bold",
              }}
            >
              {isSaved ? "Saved! ✓" : "Save Deck 💾"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.progressText}>
            Card {currentIndex + 1} of {cards.length}
          </Text>

          <FlipCard
            frontText={cards[currentIndex].front}
            backText={cards[currentIndex].back}
          />

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: Colors.error }]}
              onPress={nextCard}
            >
              <Text style={styles.controlText}>Need Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: Colors.success }]}
              onPress={nextCard}
            >
              <Text style={styles.controlText}>Got It! 🧠</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 24,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 20,
  },
  deckContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.muted,
    marginBottom: 30,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 300,
    marginTop: 40,
  },
  controlBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: Colors.text.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  controlText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
