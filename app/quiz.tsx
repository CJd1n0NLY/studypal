import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../components/BouncyButton";
import { SparkyMascot } from "../components/SparkyMascot";
import { Colors } from "../constants/colors";
import { generateQuiz } from "../services/openai";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleGenerate = async () => {
    if (topic.trim().length < 3) return;
    setLoading(true);
    try {
      const data = await generateQuiz(topic);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      setSelectedAnswer(null);
    } catch (error) {
      alert("Sparky had trouble making the quiz. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent double clicking
    setSelectedAnswer(option);

    if (option === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  // State 1: Input Topic
  if (questions.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{ title: "Quiz Mode", headerBackTitle: "Back" }}
        />
        <View style={styles.inputContainer}>
          <SparkyMascot size={100} />
          <Text style={styles.title}>What should I quiz you on?</Text>
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

  // State 2: Loading
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <SparkyMascot size={120} />
        <Text style={styles.loadingText}>
          Sparky is writing the questions...
        </Text>
        <ActivityIndicator
          size="large"
          color={Colors.warning}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  // State 3: Quiz Finished
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Results", headerBackTitle: "Back" }} />
        <Text style={{ fontSize: 60, marginBottom: 20 }}>
          {percentage >= 80 ? "🏆" : "📚"}
        </Text>
        <Text style={styles.title}>You scored {percentage}%!</Text>
        <Text style={styles.subtitle}>
          {score} out of {questions.length} correct
        </Text>
        <BouncyButton
          title="Try Another Topic"
          onPress={() => setQuestions([])}
          style={{ marginTop: 40 }}
        />
      </SafeAreaView>
    );
  }

  // State 4: Active Quiz
  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Question ${currentIndex + 1}/${questions.length}`,
          headerBackTitle: "Quit",
        }}
      />
      <ScrollView contentContainerStyle={styles.quizContent}>
        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;

            let backgroundColor = Colors.surface;
            let borderColor = "transparent";

            if (selectedAnswer) {
              if (isCorrect) {
                backgroundColor = "#E8F5E9"; // Light green
                borderColor = Colors.success;
              } else if (isSelected && !isCorrect) {
                backgroundColor = "#FFEBEE"; // Light red
                borderColor = Colors.error;
              }
            } else if (isSelected) {
              backgroundColor = "#EAE8FF"; // Light primary
              borderColor = Colors.primary;
            }

            return (
              <TouchableOpacity
                key={idx}
                disabled={selectedAnswer !== null}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor,
                    borderColor,
                    borderWidth: selectedAnswer ? 2 : 0,
                  },
                ]}
                onPress={() => handleAnswer(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer &&
                      isCorrect && {
                        fontWeight: "bold",
                        color: Colors.success,
                      },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation & Next Button */}
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
                  ? "Finish Quiz"
                  : "Next Question"
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
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: { fontSize: 18, color: Colors.text.muted },
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
  quizContent: { padding: 24 },
  progressBg: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 30,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.warning,
    borderRadius: 5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 30,
    lineHeight: 30,
  },
  optionsContainer: { gap: 16 },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 16, color: Colors.text.dark },
  feedbackContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  explanationTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  explanationText: { fontSize: 16, color: Colors.text.muted, lineHeight: 24 },
});
