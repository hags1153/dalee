// Deterministic "daily" engine — everyone gets the same puzzles each day.
export const DAY_MS = 86_400_000;
const EPOCH_UTC = Date.UTC(2026, 0, 1);
const EASTERN_TZ = "America/New_York";

function easternParts(d: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: EASTERN_TZ,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(d);
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
    return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour") };
  } catch {
    const shifted = new Date(d.getTime() - 5 * 60 * 60 * 1000);
    return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate(), hour: shifted.getUTCHours() };
  }
}

export function dayIndex(d: Date = new Date()): number {
  const parts = easternParts(d);
  const gameDate = Date.UTC(parts.year, parts.month - 1, parts.day) - (parts.hour < 4 ? DAY_MS : 0);
  return Math.floor((gameDate - EPOCH_UTC) / DAY_MS);
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
  const parts = easternParts(d);
  const gameDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - (parts.hour < 4 ? DAY_MS : 0));
  return gameDate.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
}
