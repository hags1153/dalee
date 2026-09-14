import { Platform } from "react-native";
import ExpoGameCenter from "expo-game-center";

export type LeaderboardPeriod = "daily" | "weekly" | "yearly";

export const LEADERBOARD_IDS: Record<LeaderboardPeriod, string> = {
  daily: "com.racescan.dalee.daily_recurring_score",
  weekly: "com.racescan.dalee.weekly_recurring_score",
  yearly: "com.racescan.dalee.yearly_score",
};

export const ACHIEVEMENT_IDS = {
  wordleWin: "com.racescan.dalee.achievement.wordle_win",
  wordleAce: "com.racescan.dalee.achievement.wordle_ace",
  wordleComeback: "com.racescan.dalee.achievement.wordle_comeback",
  scrambleWin: "com.racescan.dalee.achievement.scramble_win",
  scrambleClean: "com.racescan.dalee.achievement.scramble_clean",
  ladderWin: "com.racescan.dalee.achievement.ladder_win",
  ladderShort: "com.racescan.dalee.achievement.ladder_short",
  missingWin: "com.racescan.dalee.achievement.missing_win",
  crosswordClean: "com.racescan.dalee.achievement.crossword_clean",
  blitzWin: "com.racescan.dalee.achievement.blitz_win",
  blitzTen: "com.racescan.dalee.achievement.blitz_10_words",
  blitzTwenty: "com.racescan.dalee.achievement.blitz_20_words",
  circuitComplete: "com.racescan.dalee.achievement.circuit_complete",
  cleanCircuit: "com.racescan.dalee.achievement.clean_circuit",
  threeDayStreak: "com.racescan.dalee.achievement.streak_3",
  sevenDayStreak: "com.racescan.dalee.achievement.streak_7",
  thirtyDayStreak: "com.racescan.dalee.achievement.streak_30",
  fiveThousand: "com.racescan.dalee.achievement.score_5000",
  sixThousand: "com.racescan.dalee.achievement.score_6000",
  sevenThousand: "com.racescan.dalee.achievement.score_7000",
} as const;

const isIOS = Platform.OS === "ios";

export async function authenticateGameCenter() {
  if (!isIOS) return false;
  try {
    const available = await ExpoGameCenter.isGameCenterAvailable();
    if (!available) return false;
    return await ExpoGameCenter.authenticateLocalPlayer();
  } catch (error) {
    console.log("[Dalee] Game Center auth failed", error);
    return false;
  }
}

export async function submitDailyLeaderboardScore(score: number) {
  if (!Number.isFinite(score) || score <= 0) return false;
  const authed = await authenticateGameCenter();
  if (!authed) return false;
  try {
    const rounded = Math.round(score);
    const results = await Promise.all(
      Object.values(LEADERBOARD_IDS).map((leaderboardID) => ExpoGameCenter.submitScore(rounded, leaderboardID))
    );
    return results.every(Boolean);
  } catch (error) {
    console.log("[Dalee] Game Center score submit failed", error);
    return false;
  }
}

export async function reportAchievement(achievementID: string, percentComplete = 100) {
  const authed = await authenticateGameCenter();
  if (!authed) return false;
  try {
    return await ExpoGameCenter.reportAchievement(achievementID, percentComplete);
  } catch (error) {
    console.log("[Dalee] Game Center achievement failed", achievementID, error);
    return false;
  }
}

export async function reportAchievements(achievementIDs: string[]) {
  const unique = [...new Set(achievementIDs)];
  if (!unique.length) return true;
  const authed = await authenticateGameCenter();
  if (!authed) return false;
  try {
    const results = await Promise.all(unique.map((id) => ExpoGameCenter.reportAchievement(id, 100)));
    return results.every(Boolean);
  } catch (error) {
    console.log("[Dalee] Game Center achievements failed", error);
    return false;
  }
}

export async function showLeaderboard(period: LeaderboardPeriod) {
  if (!isIOS) return false;
  try {
    await authenticateGameCenter();
    await ExpoGameCenter.presentLeaderboard(LEADERBOARD_IDS[period]);
    return true;
  } catch (error) {
    console.log("[Dalee] Game Center leaderboard failed", error);
    return false;
  }
}

export async function showAchievements() {
  if (!isIOS) return false;
  try {
    await authenticateGameCenter();
    await ExpoGameCenter.presentAchievements();
    return true;
  } catch (error) {
    console.log("[Dalee] Game Center achievements UI failed", error);
    return false;
  }
}

export async function showGameCenterDashboard() {
  if (!isIOS) return false;
  try {
    await authenticateGameCenter();
    await ExpoGameCenter.presentGameCenterViewController();
    return true;
  } catch (error) {
    console.log("[Dalee] Game Center dashboard failed", error);
    return false;
  }
}
