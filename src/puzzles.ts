import { seededRng } from "./daily";
import { BLITZ_BASES, LADDERS, MINI_CROSSWORDS, MISSING, SCRAMBLE_WORDS, WORDLE_ANSWERS } from "./wordbank";

type MissingPuzzle = (typeof MISSING)[number];
type LadderPuzzle = (typeof LADDERS)[number];
type MiniCrossword = (typeof MINI_CROSSWORDS)[number];

const saltSeed = (seed: number, salt: number) => seed - (((seed % 100) + 100) % 100) + salt;

function pickUnique<T>(items: T[], seed: number, blocked: Set<string>, valueOf: (item: T) => string): T {
  const start = Math.floor(seededRng(seed)() * items.length);
  for (let offset = 0; offset < items.length; offset++) {
    const item = items[(start + offset) % items.length];
    if (!blocked.has(valueOf(item).toUpperCase())) return item;
  }
  return items[start];
}

export function wordleAnswer(seed: number): string {
  return pickUnique(WORDLE_ANSWERS, saltSeed(seed, 1), new Set(), (word) => word);
}

export function scrambleAnswer(seed: number): string {
  const used = new Set([wordleAnswer(seed)]);
  return pickUnique(SCRAMBLE_WORDS, saltSeed(seed, 2), used, (word) => word);
}

export function missingPuzzle(seed: number): MissingPuzzle {
  const used = new Set([wordleAnswer(seed), scrambleAnswer(seed)]);
  return pickUnique(MISSING, saltSeed(seed, 4), used, (puzzle) => puzzle.word);
}

export function miniCrossword(seed: number): MiniCrossword {
  const used = new Set([wordleAnswer(seed), scrambleAnswer(seed)]);
  const start = Math.floor(seededRng(saltSeed(seed, 4))() * MINI_CROSSWORDS.length);
  for (let offset = 0; offset < MINI_CROSSWORDS.length; offset++) {
    const puzzle = MINI_CROSSWORDS[(start + offset) % MINI_CROSSWORDS.length];
    if (puzzle.entries.every((entry) => !used.has(entry.answer.toUpperCase()))) return puzzle;
  }
  return MINI_CROSSWORDS[start];
}

export function ladderPuzzle(seed: number): LadderPuzzle {
  return pickUnique(LADDERS, saltSeed(seed, 3), new Set(), (puzzle) => `${puzzle.start}:${puzzle.end}`);
}

export function blitzLetters(seed: number): string {
  return pickUnique(BLITZ_BASES, saltSeed(seed, 5), new Set(), (word) => word);
}
