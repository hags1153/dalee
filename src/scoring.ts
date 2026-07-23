// Dalee scoring — big, satisfying numbers. Every game tops out around ~1200,
// a full circuit clears ~5,000+, and finishing all five lands a fat completion bonus.
// Kept in one place so the Hub, storage, and each game agree on the math.

export const COMPLETION_BONUS = 750; // for finishing the full daily circuit

// Wordle — fewer guesses, bigger reward.
const WORDLE_BY_GUESS = [0, 1200, 1000, 820, 640, 480, 320];
export const wordleScore = (guesses: number, won: boolean) =>
  !won ? 0 : WORDLE_BY_GUESS[guesses] ?? 320;

// Scramble — start high, lose points for wrong tries and hints.
export const SCRAMBLE_WRONG = 120, SCRAMBLE_HINT = 180;
export const scrambleScore = (wrong: number, hints: number) =>
  Math.max(200, 1000 - wrong * SCRAMBLE_WRONG - hints * SCRAMBLE_HINT);

// Ladder — the shorter the chain, the bigger the score.
export const ladderScore = (steps: number) =>
  Math.max(350, 1150 - steps * 80);

// Missing — clean fills win big; wrong guesses and hints bite.
export const MISSING_WRONG = 130, MISSING_HINT = 220;
export const missingScore = (wrong: number, hints: number) =>
  Math.max(200, 1000 - wrong * MISSING_WRONG - hints * MISSING_HINT);

// Blitz — points per word by length; they add up fast in 60s.
export const blitzWordPts = (len: number) =>
  len >= 7 ? 250 : len === 6 ? 150 : len === 5 ? 90 : len === 4 ? 45 : 20;

// Speed matters: a bonus up to +300 that decays to 0 by ~60 seconds.
export const timeBonus = (seconds: number) =>
  Math.max(0, Math.round(300 - seconds * 5));

// Bailing out and starting a game over costs you.
export const RESTART_PENALTY = 100;
export const applyRestarts = (score: number, restarts: number) =>
  Math.max(0, score - Math.max(0, restarts) * RESTART_PENALTY);

// Thousands separators without relying on Intl (Hermes is spotty on it).
export const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
