import { create } from 'zustand';
import { ALL_DISHES } from '@/data/dishes';
import {
  AnsweredStep,
  answersFromSteps,
  applyAnswer,
  nextQuestionId,
  poolFor,
  RESULT_THRESHOLD,
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
  /** stack of question ids shown so far, for the back button */
  visited: string[];
  shuffleSeed: number;

  start: () => void;
  answer: (questionId: string, optionId: string) => AnswerOutcome;
  goBack: () => void;
  reshuffle: () => void;
}

const freshSeed = () => Math.floor(Math.random() * 1_000_000) + 1;

export const useDecider = create<DeciderStore>((set, get) => ({
  steps: [],
  currentQuestionId: FIRST_QUESTION_ID,
  visited: [FIRST_QUESTION_ID],
  shuffleSeed: freshSeed(),

  start: () =>
    set({
      steps: [],
      currentQuestionId: FIRST_QUESTION_ID,
      visited: [FIRST_QUESTION_ID],
      shuffleSeed: freshSeed(),
    }),

  answer: (questionId, optionId) => {
    const { steps } = get();
    const res = applyAnswer(ALL_DISHES, steps, questionId, optionId);
    const nextId = nextQuestionId(questionId, answersFromSteps(res.steps));
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
    set({
      visited: nextVisited,
      currentQuestionId: nextVisited[nextVisited.length - 1],
      steps: steps.slice(0, -1),
    });
  },

  reshuffle: () => set({ shuffleSeed: freshSeed() }),
}));

/** Imperative pool read (outside React). Components should use the hooks in pool.ts. */
export const currentPool = () => poolFor(ALL_DISHES, useDecider.getState().steps);
