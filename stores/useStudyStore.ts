import { create } from "zustand";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

interface StudyState {
  streak: number;
  dailyGoalMinutes: number;
  minutesStudiedToday: number;
  savedDecks: Deck[];

  clearCache: () => void;

  // Dashboard Stats
  totalSessions: number;
  quizAverage: number;
  totalQuizzesTaken: number; // Needed to calculate the rolling average

  // Actions
  incrementStreak: () => void;
  addStudyTime: (minutes: number) => void;
  saveDeck: (deck: Deck) => void;
  setDailyGoal: (goal: number) => void;
  removeDeck: (id: string) => void;
  incrementSessions: () => void;
  updateQuizAverage: (newScore: number) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  streak: 0,
  dailyGoalMinutes: 30,
  minutesStudiedToday: 0,
  savedDecks: [],

  // Initialize with your dashboard's previous hardcoded values so it looks populated!
  totalSessions: 0,
  quizAverage: 0,
  totalQuizzesTaken: 0,

  clearCache: () =>
    set({
      streak: 0,
      minutesStudiedToday: 0,
      totalSessions: 0,
      quizAverage: 0,
      totalQuizzesTaken: 0,
      // Note: We intentionally DON'T wipe savedDecks here, because
      // clearing cache shouldn't delete the user's hard-earned flashcards!
    }),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  addStudyTime: (minutes) =>
    set((state) => ({
      minutesStudiedToday: state.minutesStudiedToday + minutes,
    })),

  saveDeck: (deck) =>
    set((state) => ({
      savedDecks: [deck, ...state.savedDecks],
    })),

  setDailyGoal: (goal) => set({ dailyGoalMinutes: goal }),

  removeDeck: (id) =>
    set((state) => ({
      savedDecks: state.savedDecks.filter((deck) => deck.id !== id),
    })),

  incrementSessions: () =>
    set((state) => ({
      totalSessions: state.totalSessions + 1,
    })),

  updateQuizAverage: (newScore) =>
    set((state) => {
      // Calculate a true rolling average
      const newTotalQuizzes = state.totalQuizzesTaken + 1;
      const newAverage = Math.round(
        (state.quizAverage * state.totalQuizzesTaken + newScore) /
          newTotalQuizzes,
      );

      return {
        quizAverage: newAverage,
        totalQuizzesTaken: newTotalQuizzes,
      };
    }),
}));
