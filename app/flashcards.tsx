import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Animated as RNAnimated,
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
import { useToast } from "../components/ToastNotification";
import { Colors } from "../constants/colors";
import { generateFlashcards } from "../services/openai";
import { playSound, unloadAllSounds } from "../services/soundManager";
import { useStudyStore } from "../stores/useStudyStore";

interface CardData {
  front: string;
  back: string;
}

export default function FlashcardsScreen() {
  const { showToast } = useToast();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const { saveDeck, savedDecks } = useStudyStore();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Mirror currentIndex in a ref so panResponder (created once) always sees the latest value
  const currentIndexRef = useRef(0);
  const setCurrentIndexSynced = (val: number | ((prev: number) => number)) => {
    setCurrentIndex((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      currentIndexRef.current = next;
      return next;
    });
  };
  const [known, setKnown] = useState<number[]>([]);
  const [review, setReview] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Load a saved deck when navigated from Library
  React.useEffect(() => {
    if (deckId) {
      const deck = savedDecks?.find((d) => d.id === deckId);
      if (deck) {
        const mapped = deck.cards.map((c) => ({
          front: c.front,
          back: c.back,
        }));
        cardsRef.current = mapped;
        setTopic(deck.title);
        setCards(mapped);
        setCurrentIndexSynced(0);
        setKnown([]);
        setReview([]);
        setIsSaved(true);
        setIsFinished(false);
      }
    }
  }, [deckId]);

  // Swipe pan state
  const pan = useRef(new RNAnimated.ValueXY()).current;
  const swipeHint = useRef(new RNAnimated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: RNAnimated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 100) {
          handleSwipe("right");
        } else if (g.dx < -100) {
          handleSwipe("left");
        } else {
          RNAnimated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const finishDeck = () => {
    // Show finished state immediately, then play sound — don't block on sound
    setIsFinished(true);
    unloadAllSounds()
      .then(() => playSound("celebrate"))
      .catch(() => {});
  };

  // Mirror cards in a ref so panResponder callback always sees latest cards array
  const cardsRef = useRef<CardData[]>([]);

  const handleSwipe = (direction: "left" | "right") => {
    const toX = direction === "right" ? 500 : -500;
    playSound("next_previous").catch(() => {});
    RNAnimated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      const idx = currentIndexRef.current;
      const totalCards = cardsRef.current.length;
      if (direction === "right") {
        setKnown((k) => [...k, idx]);
        showToast({
          message: "Got it! Keep going 🧠",
          type: "success",
          duration: 1500,
        });
      } else {
        setReview((r) => [...r, idx]);
        showToast({
          message: "Added to review pile 📝",
          type: "info",
          duration: 1500,
        });
      }
      if (idx < totalCards - 1) {
        setCurrentIndexSynced(idx + 1);
      } else {
        finishDeck();
      }
    });
  };

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      showToast({
        message: "Enter a topic first!",
        type: "warning",
        emoji: "✏️",
      });
      return;
    }
    setLoading(true);
    try {
      const deck = await generateFlashcards(topic);
      cardsRef.current = deck;
      setCards(deck);
      setCurrentIndexSynced(0);
      setIsSaved(false);
      setKnown([]);
      setReview([]);
      showToast({
        message: `${deck.length} cards ready! Tap to flip 🃏`,
        type: "success",
      });
    } catch {
      showToast({
        message: "Sparky couldn't generate cards. Check your connection!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeck = () => {
    if (isSaved) return;
    saveDeck({
      id: Date.now().toString(),
      title: topic,
      cards: cards.map((c, i) => ({
        id: `${Date.now()}-${i}`,
        front: c.front,
        back: c.back,
      })),
      createdAt: new Date().toISOString(),
    });
    setIsSaved(true);
    showToast({
      message: "Deck saved to your Library! 📚",
      type: "success",
      emoji: "💾",
    });
  };

  const cardRotation = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-12deg", "0deg", "12deg"],
  });
  const cardOpacity = pan.x.interpolate({
    inputRange: [-200, -80, 0, 80, 200],
    outputRange: [0.6, 1, 1, 1, 0.6],
  });
  const leftOpacity = pan.x.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
  });
  const rightOpacity = pan.x.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
  });

  // ─── State 1: Input ───
  if (cards.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{ title: "Flashcard Studio", headerBackTitle: "Back" }}
        />
        <View style={styles.inputContainer}>
          <SparkyMascot size={110} />
          <Text style={styles.title}>What are we studying?</Text>
          <Text style={styles.subtitle}>
            Swipe right = got it · Swipe left = review
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Philippine History, React Hooks..."
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
      </SafeAreaView>
    );
  }

  // ─── State 2: Loading ───
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={130} mood="thinking" />
        <Text style={styles.loadingText}>Crafting the perfect cards...</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  // ─── State 4: Finished ───
  if (isFinished) {
    const percentage = Math.round((known.length / cards.length) * 100) || 0;
    const isPassing = percentage >= 80;
    const gradeColor = isPassing ? Colors.success : Colors.warning;

    return (
      <SafeAreaView style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Results", headerBackTitle: "Back" }} />
        {/* If you imported ConfettiExplosion, you can use it here! */}
        <SparkyMascot size={140} mood={isPassing ? "excited" : "happy"} />

        <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>
            {percentage}%
          </Text>
        </View>

        <Text style={styles.title}>Deck Complete! 🎉</Text>
        <Text style={styles.subtitle}>
          You knew {known.length} out of {cards.length} cards.
        </Text>

        <View style={styles.controls}>
          <BouncyButton
            title="Study New Topic"
            onPress={() => {
              cardsRef.current = [];
              setCards([]);
              setTopic("");
              setIsFinished(false);
            }}
            style={{ flex: 1 }}
          />
          <BouncyButton
            title="Retry Deck"
            type="outline"
            onPress={() => {
              setCurrentIndexSynced(0);
              setKnown([]);
              setReview([]);
              setIsFinished(false);
            }}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── State 3: Viewing ───
  const progress = (currentIndex / cards.length) * 100;
  const currentCard = cards[currentIndex];

  // Safety guard — should never happen but prevents the TypeError crash
  if (!currentCard) return null;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: "Flashcard Studio", headerBackTitle: "Back" }}
      />

      {/* Header row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.topicLabel}>{topic}</Text>
          <Text style={styles.progressLabel}>
            Card {currentIndex + 1} of {cards.length} · ✅ {known.length} known
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
          onPress={handleSaveDeck}
        >
          <Text style={[styles.saveBtnText, isSaved && { color: "white" }]}>
            {isSaved ? "Saved ✓" : "Save 💾"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Swipe hints overlay */}
      <View style={styles.hintRow}>
        <RNAnimated.View
          style={[styles.hintBadge, styles.hintLeft, { opacity: leftOpacity }]}
        >
          <Text style={styles.hintLeftText}>← Review</Text>
        </RNAnimated.View>
        <RNAnimated.View
          style={[
            styles.hintBadge,
            styles.hintRight,
            { opacity: rightOpacity },
          ]}
        >
          <Text style={styles.hintRightText}>Got It! →</Text>
        </RNAnimated.View>
      </View>

      {/* Card with pan gesture */}
      <View style={styles.cardArea}>
        <RNAnimated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX: pan.x }, { rotate: cardRotation }],
            opacity: cardOpacity,
          }}
        >
          <FlipCard frontText={currentCard.front} backText={currentCard.back} />
        </RNAnimated.View>
      </View>

      {/* Manual buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: "#FFEBEE" }]}
          onPress={() => handleSwipe("left")}
        >
          <Text style={styles.controlIcon}>←</Text>
          <Text style={[styles.controlText, { color: Colors.error }]}>
            Review
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: "#E8F5E9" }]}
          onPress={() => handleSwipe("right")}
        >
          <Text style={[styles.controlText, { color: Colors.success }]}>
            Got It!
          </Text>
          <Text style={styles.controlIcon}>→</Text>
        </TouchableOpacity>
      </View>
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
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.muted,
    marginBottom: 28,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
    color: Colors.text.dark,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topicLabel: { fontSize: 16, fontWeight: "bold", color: Colors.text.dark },
  progressLabel: { fontSize: 13, color: Colors.text.muted, marginTop: 2 },
  saveBtn: {
    backgroundColor: "#EAE8FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveBtnDone: { backgroundColor: Colors.success },
  saveBtnText: { fontWeight: "bold", color: Colors.primary, fontSize: 13 },
  progressBg: {
    height: 6,
    backgroundColor: "#E8E8FF",
    marginHorizontal: 20,
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 8,
    height: 30,
  },
  hintBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  hintLeft: { backgroundColor: "#FFEBEE" },
  hintRight: { backgroundColor: "#E8F5E9" },
  hintLeftText: { color: Colors.error, fontWeight: "bold", fontSize: 13 },
  hintRightText: { color: Colors.success, fontWeight: "bold", fontSize: 13 },
  cardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  controlBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  controlIcon: { fontSize: 20 },
  controlText: { fontWeight: "bold", fontSize: 16 },
  gradeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  gradeText: { fontSize: 32, fontWeight: "900" },
});
