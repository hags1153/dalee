// Dalee scoring — big, satisfying numbers. Every game tops out around ~1200,
// a full circuit clears ~5,000+, and finishing all five lands a fat completion bonus.
// Kept in one place so the Hub, storage, and each game agree on the math.

export const COMPLETION_BONUS = 750; // for finishing the full daily circuit

// Wordle — fewer guesses, bigger reward.
const WORDLE_BY_GUESS = [0, 1200, 1000, 820, 640, 480, 320];
export const wordleScore = (guesses: number, won: boolean) =>
  !won ? 0 : WORDLE_BY_GUESS[guesses] ?? 320;

// Scramble — start high, lose points for wrong tries and hints.
export const scrambleScore = (wrong: number, hints: number) =>
  Math.max(200, 1000 - wrong * 120 - hints * 180);

// Ladder — the shorter the chain, the bigger the score.
export const ladderScore = (steps: number) =>
  Math.max(350, 1150 - steps * 80);

// Missing — clean fills win big; wrong guesses and hints bite.
export const missingScore = (wrong: number, hints: number) =>
  Math.max(200, 1000 - wrong * 130 - hints * 220);

// Blitz — points per word by length; they add up fast in 60s.
export const blitzWordPts = (len: number) =>
  len >= 7 ? 250 : len === 6 ? 150 : len === 5 ? 90 : len === 4 ? 45 : 20;

// Thousands separators without relying on Intl (Hermes is spotty on it).
export const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
