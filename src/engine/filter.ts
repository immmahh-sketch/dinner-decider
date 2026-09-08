import { Dish } from './types';
import { Answers, AnswerOption, Question, QUESTIONS, QUESTION_ORDER } from './questions';

export interface AnsweredStep {
  questionId: string;
  optionId: string;
  /** true when applying this answer's filter would have emptied the pool, so we skipped it */
  ignored: boolean;
}

const optionFor = (questionId: string, optionId: string): AnswerOption | undefined =>
  QUESTIONS[questionId]?.options.find((o) => o.id === optionId);

export function answersFromSteps(steps: AnsweredStep[]): Answers {
  const a: Answers = {};
  for (const s of steps) a[s.questionId] = s.optionId;
  return a;
}

/**
 * Fold every kept answer's predicate over the full deck.
 * Guess Who style: a dish survives only if it passes every non-ignored answer.
 */
export function poolFor(all: Dish[], steps: AnsweredStep[]): Dish[] {
  let pool = all;
  for (const step of steps) {
    if (step.ignored) continue;
    const opt = optionFor(step.questionId, step.optionId);
    if (!opt?.keep) continue;
    pool = pool.filter(opt.keep);
  }
  return pool;
}

export interface ApplyResult {
  steps: AnsweredStep[];
  pool: Dish[];
  ignored: boolean;
}

/**
 * Apply one answer. If the answer's filter would wipe the pool out entirely we
 * keep the answer on record but mark it ignored, so the user never dead-ends.
 */
export function applyAnswer(
  all: Dish[],
  steps: AnsweredStep[],
  questionId: string,
  optionId: string,
): ApplyResult {
  const withoutThis = steps.filter((s) => s.questionId !== questionId);
  const opt = optionFor(questionId, optionId);
  const tentative: AnsweredStep = { questionId, optionId, ignored: false };

  let ignored = false;
  if (opt?.keep) {
    const candidate = poolFor(all, [...withoutThis, tentative]);
    if (candidate.length === 0) ignored = true;
  }

  const nextSteps = [...withoutThis, { ...tentative, ignored }];
  return { steps: nextSteps, pool: poolFor(all, nextSteps), ignored };
}

/**
 * Walk QUESTION_ORDER from just after `currentId` and return the first question
 * that applies for the answers gathered so far. null = go to results.
 */
export function nextQuestionId(currentId: string, answers: Answers): string | null {
  const from = QUESTION_ORDER.indexOf(currentId);
  for (let i = from + 1; i < QUESTION_ORDER.length; i++) {
    const q = QUESTIONS[QUESTION_ORDER[i]];
    if (!q) continue;
    if (!q.when || q.when(answers)) return q.id;
  }
  return null;
}

export function questionById(id: string): Question | undefined {
  return QUESTIONS[id];
}

/** Deterministic shuffle so a given remaining-set always shows in the same order. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  const rand = () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const RESULT_THRESHOLD = 10;
