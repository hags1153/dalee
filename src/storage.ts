import AsyncStorage from "@react-native-async-storage/async-storage";
import { CIRCUIT, GameKey } from "./theme";
import { COMPLETION_BONUS } from "./scoring";

export type GameResult = {
  done: boolean;
  won: boolean;
  score: number;
  guesses?: number;
  seconds?: number;
  wrong?: number;
  hints?: number;
  steps?: number;
  wordsFound?: number;
};
// `opens` counts scored-game starts; opens-1 = restarts. `funOpens` rotates completed games into fresh non-scoring variants.
export type DayState = {
  day: number;
  results: Partial<Record<GameKey, GameResult>>;
  opens?: Partial<Record<GameKey, number>>;
  funOpens?: Partial<Record<GameKey, number>>;
};
export type Stats = {
  streak: number; maxStreak: number; circuitsCompleted: number;
  lastCircuitDay: number; totalScore: number; gamesPlayed: number; bestDay: number;
};
export type Settings = { liveScoreVisible: boolean };

const emptyStats = (): Stats => ({ streak: 0, maxStreak: 0, circuitsCompleted: 0, lastCircuitDay: -999, totalScore: 0, gamesPlayed: 0, bestDay: 0 });
const defaultSettings = (): Settings => ({ liveScoreVisible: true });

export async function loadDay(day: number): Promise<DayState> {
  try { const s = await AsyncStorage.getItem(`day:${day}`); if (s) return JSON.parse(s); } catch {}
  return { day, results: {} };
}
export async function saveDay(state: DayState) {
  try { await AsyncStorage.setItem(`day:${state.day}`, JSON.stringify(state)); } catch {}
}
export async function loadStats(): Promise<Stats> {
  try { const s = await AsyncStorage.getItem("stats"); if (s) return { ...emptyStats(), ...JSON.parse(s) }; } catch {}
  return emptyStats();
}
export async function saveStats(s: Stats) {
  try { await AsyncStorage.setItem("stats", JSON.stringify(s)); } catch {}
}
export async function loadSettings(): Promise<Settings> {
  try { const s = await AsyncStorage.getItem("settings"); if (s) return { ...defaultSettings(), ...JSON.parse(s) }; } catch {}
  return defaultSettings();
}
export async function saveSettings(s: Settings) {
  try { await AsyncStorage.setItem("settings", JSON.stringify(s)); } catch {}
}

export const circuitComplete = (d: DayState) => CIRCUIT.every((g) => d.results[g]?.done);
export const circuitScore = (d: DayState) => CIRCUIT.reduce((n, g) => n + (d.results[g]?.score || 0), 0);
export const circuitProgress = (d: DayState) => CIRCUIT.filter((g) => d.results[g]?.done).length;
// Today's headline number: the sum of game scores, plus the completion bonus once all five are done.
export const dayTotal = (d: DayState) => circuitScore(d) + (circuitComplete(d) ? COMPLETION_BONUS : 0);

// Called when a circuit is finished; updates streak + totals once per day.
export async function commitCircuit(day: number, d: DayState): Promise<Stats> {
  const stats = await loadStats();
  if (stats.lastCircuitDay === day) return stats; // already counted today
  const total = dayTotal(d);
  stats.circuitsCompleted += 1;
  stats.streak = stats.lastCircuitDay === day - 1 ? stats.streak + 1 : 1;
  stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
  stats.totalScore += total;
  stats.bestDay = Math.max(stats.bestDay, total);
  stats.lastCircuitDay = day;
  await saveStats(stats);
  return stats;
}
