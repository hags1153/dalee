// Deterministic "daily" engine — everyone gets the same puzzles each day.
export const DAY_MS = 86_400_000;
const EPOCH = new Date(2026, 0, 1).getTime();

export function dayIndex(d: Date = new Date()): number {
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.floor((midnight - EPOCH) / DAY_MS);
}

// mulberry32 — small, fast, deterministic PRNG
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRng(seed)() * arr.length)];
}

export function shuffle<T>(arr: T[], seed: number): T[] {
  const r = seededRng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// distinct per-game seed so the 5 games don't correlate
export const seedFor = (salt: number, d: Date = new Date()) => dayIndex(d) * 100 + salt;

export function prettyDate(d: Date = new Date()): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
