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
  incrementStreak: () => void;
  addStudyTime: (minutes: number) => void;
  saveDeck: (deck: Deck) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  streak: 12, // Example starting streak
  dailyGoalMinutes: 30,
  minutesStudiedToday: 15,
  savedDecks: [],
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  addStudyTime: (minutes) =>
    set((state) => ({
      minutesStudiedToday: state.minutesStudiedToday + minutes,
    })),
  saveDeck: (deck) =>
    set((state) => ({
      savedDecks: [deck, ...state.savedDecks],
    })),
}));
