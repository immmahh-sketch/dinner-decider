import { create } from 'zustand';
import { ALL_DISHES } from '@/data/dishes';
import { Dish } from '@/engine/types';
import {
  AnsweredStep,
  applyAnswer,
  nextQuestionId,
  poolFor,
  RESULT_THRESHOLD,
  seededShuffle,
} from '@/engine/filter';
import { FIRST_QUESTION_ID } from '@/engine/questions';

interface AnswerOutcome {
  count: number;
  done: boolean;
  nextId: string | null;
  ignored: boolean;
}

interface DeciderStore {
  steps: AnsweredStep[];
  currentQuestionId: string;
  /** stack of visited question ids, for the back button */
  visited: string[];
  shuffleSeed: number;

  start: () => void;
  answer: (questionId: string, optionId: string) => AnswerOutcome;
  goBack: () => void;
  reshuffle: () => void;
  reset: () => void;

  pool: () => Dish[];
  count: () => number;
  results: () => Dish[];
}

export const useDecider = create<DeciderStore>((set, get) => ({
  steps: [],
  currentQuestionId: FIRST_QUESTION_ID,
  visited: [FIRST_QUESTION_ID],
  shuffleSeed: Math.floor(Math.random() * 1_000_000) + 1,

  start: () =>
    set({
      steps: [],
      currentQuestionId: FIRST_QUESTION_ID,
      visited: [FIRST_QUESTION_ID],
      shuffleSeed: Math.floor(Math.random() * 1_000_000) + 1,
    }),

  answer: (questionId, optionId) => {
    const { steps } = get();
    const res = applyAnswer(ALL_DISHES, steps, questionId, optionId);
    const nextId = nextQuestionId(questionId, optionId);
    const done = res.pool.length <= RESULT_THRESHOLD || nextId === null;

    set((s) => ({
      steps: res.steps,
      currentQuestionId: nextId ?? s.currentQuestionId,
      visited: nextId ? [...s.visited, nextId] : s.visited,
    }));

    return { count: res.pool.length, done, nextId, ignored: res.ignored };
  },

  goBack: () => {
    const { visited, steps } = get();
    if (visited.length <= 1) return;
    const nextVisited = visited.slice(0, -1);
    const leaving = visited[visited.length - 1];
    set({
      visited: nextVisited,
      currentQuestionId: nextVisited[nextVisited.length - 1],
      steps: steps.filter((s) => s.questionId !== leaving),
    });
  },

  reshuffle: () => set({ shuffleSeed: Math.floor(Math.random() * 1_000_000) + 1 }),

  reset: () => get().start(),

  pool: () => poolFor(ALL_DISHES, get().steps),
  count: () => poolFor(ALL_DISHES, get().steps).length,
  results: () => {
    const pool = poolFor(ALL_DISHES, get().steps);
    return seededShuffle(pool, get().shuffleSeed).slice(0, RESULT_THRESHOLD);
  },
}));
