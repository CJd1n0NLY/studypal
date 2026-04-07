import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../components/BouncyButton";
import { ConfettiExplosion } from "../components/ConfettiExplosion";
import { SparkyMascot } from "../components/SparkyMascot";
import { useToast } from "../components/ToastNotification";
import { Colors } from "../constants/colors";
import { generateQuiz } from "../services/openai";
import { playSound } from "../services/soundManager";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Option card with shake/bounce animation on select
const OptionCard: React.FC<{
  option: string;
  index: number;
  selectedAnswer: string | null;
  correctAnswer: string;
  onPress: (o: string) => void;
}> = ({ option, index, selectedAnswer, correctAnswer, onPress }) => {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);
  const LETTERS = ["A", "B", "C", "D"];

  const isSelected = selectedAnswer === option;
  const isCorrect = option === correctAnswer;
  const revealed = selectedAnswer !== null;

  useEffect(() => {
    if (revealed && isSelected && !isCorrect) {
      // Shake on wrong
      shakeX.value = withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
    if (revealed && isCorrect) {
      scale.value = withSequence(
        withSpring(1.04, { damping: 5, stiffness: 300 }),
        withSpring(1, { damping: 8, stiffness: 200 }),
      );
    }
  }, [revealed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  let bg = Colors.surface;
  let borderColor = "#EAE8FF";
  let letterBg = "#F0EFFF";
  let letterColor = Colors.text.muted;

  if (revealed) {
    if (isCorrect) {
      bg = "#E8F5E9";
      borderColor = Colors.success;
      letterBg = Colors.success;
      letterColor = "white";
    } else if (isSelected && !isCorrect) {
      bg = "#FFEBEE";
      borderColor = Colors.error;
      letterBg = Colors.error;
      letterColor = "white";
    }
  } else if (isSelected) {
    bg = "#EAE8FF";
    borderColor = Colors.primary;
    letterBg = Colors.primary;
    letterColor = "white";
  }

  return (
    <AnimatedTouchable
      disabled={revealed}
      onPress={() => onPress(option)}
      activeOpacity={0.8}
      style={[
        styles.optionCard,
        { backgroundColor: bg, borderColor },
        animatedStyle,
      ]}
    >
      <View style={[styles.optionLetter, { backgroundColor: letterBg }]}>
        <Text style={[styles.optionLetterText, { color: letterColor }]}>
          {LETTERS[index]}
        </Text>
      </View>
      <Text style={styles.optionText}>{option}</Text>
      {revealed && isCorrect && <Text style={styles.checkmark}>✓</Text>}
      {revealed && isSelected && !isCorrect && (
        <Text style={styles.checkmark}>✗</Text>
      )}
    </AnimatedTouchable>
  );
};

export default function QuizScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleGenerate = async () => {
    if (topic.trim().length < 3) {
      showToast({
        message: "Type a topic first!",
        type: "warning",
        emoji: "✏️",
      });
      return;
    }
    setLoading(true);
    try {
      await playSound("thinking");
      const data = await generateQuiz(topic);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      setSelectedAnswer(null);
      showToast({
        message: `${data.questions.length} questions ready!`,
        type: "success",
        emoji: "🧩",
      });
    } catch (error) {
      showToast({
        message: "Sparky had trouble making the quiz. Try again!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    const isCorrect = option === questions[currentIndex].correctAnswer;

    setResults((prev) => {
      const newRes = [...prev];
      newRes[currentIndex] = isCorrect;
      return newRes;
    });

    if (isCorrect) {
      setScore((s) => s + 1);
      await playSound("correct");
      showToast({
        message: "Correct! Great job! 🎉",
        type: "success",
        duration: 1800,
      });
    } else {
      await playSound("wrong");
      showToast({
        message: "Not quite — check the explanation below.",
        type: "error",
        duration: 2500,
      });
    }
  };

  const nextQuestion = async () => {
    await playSound("next_previous");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);

      showToast({
        message: "Quiz complete! Let's see your score 🏆",
        type: "success",
        duration: 3000,
      });
    }
  };

  // ─── State 1: Input ───────────────────────────────────────────
  if (questions.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{ title: "Quiz Mode", headerBackTitle: "Back" }}
        />
        <View style={styles.inputContainer}>
          <SparkyMascot size={110} mood="default" />
          <Text style={styles.title}>What should I quiz you on?</Text>
          <Text style={styles.subtitle}>
            I'll create a custom quiz just for you!
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. World War 2, JavaScript Arrays..."
            placeholderTextColor={Colors.text.muted}
            value={topic}
            onChangeText={setTopic}
            onSubmitEditing={handleGenerate}
          />
          <BouncyButton title="Create Quiz 🧩" onPress={handleGenerate} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── State 2: Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={130} mood="thinking" />
        <Text style={styles.loadingText}>
          Sparky is writing the questions...
        </Text>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} delay={i * 200} />
          ))}
        </View>
      </View>
    );
  }

  // ─── State 3: Finished ────────────────────────────────────────
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassing = percentage >= 80;
    const grade =
      percentage >= 90
        ? "A"
        : percentage >= 80
          ? "B"
          : percentage >= 70
            ? "C"
            : percentage >= 60
              ? "D"
              : "F";
    const gradeColor =
      percentage >= 80
        ? Colors.success
        : percentage >= 60
          ? Colors.warning
          : Colors.error;

    return (
      <SafeAreaView style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Results", headerBackTitle: "Back" }} />
        <ConfettiExplosion trigger={isPassing} />
        <SparkyMascot size={140} mood={isPassing ? "excited" : "sad"} />
        <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          <Text style={[styles.percentText, { color: gradeColor }]}>
            {percentage}%
          </Text>
        </View>
        <Text style={styles.title}>
          {isPassing ? "Amazing work! 🎉" : "Keep practicing! 💪"}
        </Text>
        <Text style={styles.subtitle}>
          {score} out of {questions.length} correct
        </Text>
        <View style={styles.resultButtons}>
          <BouncyButton
            title="New Topic"
            onPress={() => {
              setQuestions([]);
              setTopic("");
            }}
            style={{ flex: 1 }}
          />
          <BouncyButton
            title="Retry"
            type="outline"
            onPress={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsFinished(false);
              setSelectedAnswer(null);
            }}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ─── State 4: Active Quiz ─────────────────────────────────────
  const currentQ = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Question ${currentIndex + 1} of ${questions.length}`,
          headerBackTitle: "Quit",
        }}
      />
      <ScrollView
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressBg}>
          <Animated.View
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>

        {/* Score badge */}
        <View style={styles.topRow}>
          <Text style={styles.topicLabel}>Topic: {topic}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        {/* Question dots */}
        <View style={styles.dots}>
          {questions.map((_, i) => {
            let dotStyle: any = styles.dot;
            if (i === currentIndex) {
              dotStyle = [styles.dot, styles.dotActive];
            } else if (results[i] === true) {
              dotStyle = [styles.dot, { backgroundColor: Colors.success }];
            } else if (results[i] === false) {
              dotStyle = [styles.dot, { backgroundColor: Colors.error }];
            }

            return <View key={i} style={dotStyle} />;
          })}
        </View>

        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, idx) => (
            <OptionCard
              key={idx}
              option={option}
              index={idx}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQ.correctAnswer}
              onPress={handleAnswer}
            />
          ))}
        </View>

        {selectedAnswer && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.explanationTitle}>
              {selectedAnswer === currentQ.correctAnswer
                ? "✅ Correct!"
                : "❌ Not quite!"}
            </Text>
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
            <BouncyButton
              title={
                currentIndex === questions.length - 1
                  ? "See Results 🏆"
                  : "Next Question →"
              }
              onPress={nextQuestion}
              style={{ marginTop: 20 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Pulsing loading dot
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.6, { duration: 300 }),
    );
    const interval = setInterval(() => {
      scale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.6, { duration: 300 }),
      );
    }, 900);
    return () => clearInterval(interval);
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: Colors.primary,
          margin: 4,
        },
        animStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 24,
  },
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
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
  loadingDots: { flexDirection: "row", marginTop: 20 },
  quizContent: { padding: 24 },
  progressBg: {
    height: 8,
    backgroundColor: "#E8E8FF",
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.warning,
    borderRadius: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topicLabel: {
    fontSize: 13,
    color: Colors.text.muted,
    fontWeight: "500",
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: { fontWeight: "bold", color: Colors.warning, fontSize: 14 },
  dots: { flexDirection: "row", gap: 6, marginBottom: 24, flexWrap: "wrap" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  dotDone: { backgroundColor: Colors.success },
  dotActive: { backgroundColor: Colors.warning, transform: [{ scale: 1.3 }] },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 28,
    lineHeight: 32,
  },
  optionsContainer: { gap: 14 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionLetter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionLetterText: { fontWeight: "bold", fontSize: 14 },
  optionText: {
    fontSize: 16,
    color: Colors.text.dark,
    flex: 1,
    lineHeight: 22,
  },
  checkmark: { fontSize: 18, marginLeft: 8 },
  feedbackContainer: {
    marginTop: 28,
    padding: 22,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#EAE8FF",
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.text.dark,
  },
  explanationText: { fontSize: 15, color: Colors.text.muted, lineHeight: 24 },
  gradeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  gradeText: { fontSize: 42, fontWeight: "900" },
  percentText: { fontSize: 16, fontWeight: "bold" },
  resultButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    width: "100%",
  },
});
