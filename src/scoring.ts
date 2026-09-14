// Dalee scoring — big, satisfying numbers with enough odd weights and fractional time
// pressure that large leaderboards are unlikely to collapse into ties.
// Kept in one place so the Hub, storage, and each game agree on the math.

export const COMPLETION_BONUS = 750; // for finishing the full daily circuit
export const MIN_GAME_SCORE = 100;

// Wordle — fewer guesses, bigger reward.
const WORDLE_BY_GUESS = [0, 1600, 1390, 1215, 1035, 860, 690];
export const wordleScore = (guesses: number, won: boolean) =>
  !won ? MIN_GAME_SCORE : WORDLE_BY_GUESS[guesses] ?? 690;

// Scramble — start high, lose points for wrong tries and hints.
export const SCRAMBLE_WRONG = 137, SCRAMBLE_HINT = 211;
export const scrambleScore = (wrong: number, hints: number) =>
  Math.max(MIN_GAME_SCORE, 1325 - wrong * SCRAMBLE_WRONG - hints * SCRAMBLE_HINT);

// Ladder — extra rows are light-touch penalties; speed separates close solves.
export const ladderScore = (steps: number) =>
  Math.max(MIN_GAME_SCORE, 1200 - steps * 5);

// Mini Crossword — clean solves win big; wrong submits and hints bite.
export const MISSING_WRONG = 149, MISSING_HINT = 233;
export const missingScore = (wrong: number, hints: number) =>
  Math.max(MIN_GAME_SCORE, 1375 - wrong * MISSING_WRONG - hints * MISSING_HINT);

// Blitz — points per word by length; they add up fast in 60s.
export const blitzWordPts = (len: number) =>
  len >= 7 ? 271 : len === 6 ? 163 : len === 5 ? 97 : len === 4 ? 47 : 23;

// Speed matters: fractional seconds make leaderboard ties much less likely.
export const timeBonus = (seconds: number) =>
  Math.max(0, Math.round(700 - seconds * 7.37));

// Bailing out and starting a game over costs you.
export const RESTART_PENALTY = 100;
export const applyRestarts = (score: number, restarts: number) =>
  Math.max(MIN_GAME_SCORE, score - Math.max(0, restarts) * RESTART_PENALTY);

// Thousands separators without relying on Intl (Hermes is spotty on it).
export const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
