import { ANSWERS } from "./words";

export type Status = "correct" | "present" | "absent" | "empty";
export const WORD_LEN = 5;
export const MAX_GUESSES = 6;

// Epoch for the "daily" rotation — puzzle #1 is 2026-01-01 (local time).
const EPOCH = new Date(2026, 0, 1).getTime();

export function dayIndex(now: Date = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.floor((midnight - EPOCH) / 86_400_000);
}

export function dailyAnswer(now: Date = new Date()): string {
  const i = ((dayIndex(now) % ANSWERS.length) + ANSWERS.length) % ANSWERS.length;
  return ANSWERS[i].toUpperCase();
}

// Standard Wordle scoring with correct double-letter handling.
export function evaluate(guess: string, answer: string): Status[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const res: Status[] = Array(WORD_LEN).fill("absent");
  const used: boolean[] = Array(WORD_LEN).fill(false);
  for (let i = 0; i < WORD_LEN; i++) {
    if (g[i] === a[i]) { res[i] = "correct"; used[i] = true; }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (res[i] === "correct") continue;
    for (let j = 0; j < WORD_LEN; j++) {
      if (!used[j] && g[i] === a[j]) { res[i] = "present"; used[j] = true; break; }
    }
  }
  return res;
}

// Best-known status per letter (for keyboard coloring). correct > present > absent.
export function mergeKeyStatuses(
  map: Record<string, Status>, guess: string, statuses: Status[]
): Record<string, Status> {
  const rank: Record<string, number> = { correct: 3, present: 2, absent: 1, empty: 0 };
  const next = { ...map };
  guess.toUpperCase().split("").forEach((ch, i) => {
    const s = statuses[i];
    if (!next[ch] || rank[s] > rank[next[ch]]) next[ch] = s;
  });
  return next;
}

export function isValidGuess(guess: string): boolean {
  return /^[A-Za-z]{5}$/.test(guess);
}
