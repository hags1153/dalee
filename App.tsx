import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { palette as C, CIRCUIT, GameKey, games } from "./src/theme";
import { dayIndex, seedFor } from "./src/daily";
import { DayState, Stats, GameResult, Settings, loadDay, saveDay, loadStats, commitCircuit, circuitComplete, dayTotal, loadSettings, saveSettings } from "./src/storage";
import { ACHIEVEMENT_IDS, LeaderboardPeriod, reportAchievements, submitDailyLeaderboardScore, showAchievements, showGameCenterDashboard, showLeaderboard } from "./src/gameCenter";
import Hub from "./src/Hub";
import SignIn from "./src/SignIn";
import Wordle from "./src/games/Wordle";
import Scramble from "./src/games/Scramble";
import Ladder from "./src/games/Ladder";
import Missing from "./src/games/Missing";
import Blitz from "./src/games/Blitz";
import { DoneAction, GameProps } from "./src/games/types";
import { UpdateRequired, useVersionGate } from "./src/VersionGate";

const GAMES: Record<GameKey, React.ComponentType<GameProps>> = {
  wordle: Wordle, scramble: Scramble, ladder: Ladder, missing: Missing, blitz: Blitz,
};
const WIN_ACHIEVEMENTS: Record<GameKey, string> = {
  wordle: ACHIEVEMENT_IDS.wordleWin,
  scramble: ACHIEVEMENT_IDS.scrambleWin,
  ladder: ACHIEVEMENT_IDS.ladderWin,
  missing: ACHIEVEMENT_IDS.missingWin,
  blitz: ACHIEVEMENT_IDS.blitzWin,
};

function resultAchievements(key: GameKey, result: GameResult) {
  const ids = result.won ? [WIN_ACHIEVEMENTS[key]] : [];
  if (key === "wordle" && result.won && result.guesses === 1) ids.push(ACHIEVEMENT_IDS.wordleAce);
  if (key === "wordle" && result.won && result.guesses === 6) ids.push(ACHIEVEMENT_IDS.wordleComeback);
  if (key === "scramble" && result.won && !result.wrong && !result.hints) ids.push(ACHIEVEMENT_IDS.scrambleClean);
  if (key === "ladder" && result.won && (result.steps || 99) <= 4) ids.push(ACHIEVEMENT_IDS.ladderShort);
  if (key === "missing" && result.won && !result.wrong && !result.hints) ids.push(ACHIEVEMENT_IDS.crosswordClean);
  if (key === "blitz" && (result.wordsFound || 0) >= 10) ids.push(ACHIEVEMENT_IDS.blitzTen);
  if (key === "blitz" && (result.wordsFound || 0) >= 20) ids.push(ACHIEVEMENT_IDS.blitzTwenty);
  return ids;
}

function circuitAchievements(next: DayState, total: number, stats: Stats) {
  const clean = CIRCUIT.every((key) => {
    const result = next.results[key];
    return result?.won && !result.wrong && !result.hints;
  });
  return [
    ACHIEVEMENT_IDS.circuitComplete,
    ...(clean ? [ACHIEVEMENT_IDS.cleanCircuit] : []),
    ...(stats.streak >= 3 ? [ACHIEVEMENT_IDS.threeDayStreak] : []),
    ...(stats.streak >= 7 ? [ACHIEVEMENT_IDS.sevenDayStreak] : []),
    ...(stats.streak >= 30 ? [ACHIEVEMENT_IDS.thirtyDayStreak] : []),
    ...(total >= 5000 ? [ACHIEVEMENT_IDS.fiveThousand] : []),
    ...(total >= 6000 ? [ACHIEVEMENT_IDS.sixThousand] : []),
    ...(total >= 7000 ? [ACHIEVEMENT_IDS.sevenThousand] : []),
  ];
}

type Screen = { name: "hub" } | { name: "game"; key: GameKey } | { name: "signin" };

export default function App() {
  const day = dayIndex();
  const versionGate = useVersionGate();
  const [screen, setScreen] = useState<Screen>({ name: "hub" });
  const [dayState, setDayState] = useState<DayState>({ day, results: {} });
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Settings>({ liveScoreVisible: true });

  useEffect(() => { (async () => { setDayState(await loadDay(day)); setStats(await loadStats()); setSettings(await loadSettings()); })(); }, [day]);

  const toggleLiveScore = useCallback(async () => {
    const next = { ...settings, liveScoreVisible: !settings.liveScoreVisible };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const onDone = useCallback(async (key: GameKey, result: GameResult, action: DoneAction = "home") => {
    const prev = dayState.results[key];
    // keep the best score if replayed
    const merged = !prev || result.score > (prev.score || 0) ? result : prev;
    let next: DayState = { ...dayState, results: { ...dayState.results, [key]: merged } };
    setDayState(next); await saveDay(next);
    reportAchievements(resultAchievements(key, result));
    if (circuitComplete(next)) {
      const committedStats = await commitCircuit(day, next);
      setStats(committedStats);
      const total = dayTotal(next);
      submitDailyLeaderboardScore(total);
      reportAchievements(circuitAchievements(next, total, committedStats));
    }
    const nextKey = CIRCUIT[CIRCUIT.indexOf(key) + 1];
    if (action === "next" && nextKey) {
      if (!next.results[nextKey]?.done) {
        next = { ...next, opens: { ...next.opens, [nextKey]: (next.opens?.[nextKey] ?? 0) + 1 } };
        setDayState(next);
        await saveDay(next);
      }
      setScreen({ name: "game", key: nextKey });
    } else {
      setScreen({ name: "hub" });
    }
  }, [dayState, day]);

  // Opening a not-yet-finished game counts as a start; the 2nd+ start is a restart.
  const openGame = useCallback(async (key: GameKey) => {
    if (dayState.results[key]?.done) {
      const funOpens = { ...dayState.funOpens, [key]: (dayState.funOpens?.[key] ?? 0) + 1 };
      const next: DayState = { ...dayState, funOpens };
      setDayState(next); await saveDay(next);
    } else {
      const opens = { ...dayState.opens, [key]: (dayState.opens?.[key] ?? 0) + 1 };
      const next: DayState = { ...dayState, opens };
      setDayState(next); await saveDay(next);
    }
    setScreen({ name: "game", key });
  }, [dayState]);

  if (versionGate.required) return (<><StatusBar style="light" /><UpdateRequired manifest={versionGate.manifest} /></>);

  if (!stats) return <View style={{ flex: 1, backgroundColor: C.bg1 }}><StatusBar style="light" /></View>;

  const openLeaderboard = (period: LeaderboardPeriod) => { showLeaderboard(period); };

  if (screen.name === "game") {
    const Game = GAMES[screen.key];
    const idx = CIRCUIT.indexOf(screen.key);
    const nextKey = CIRCUIT[idx + 1];
    const nextGameName = nextKey ? games[nextKey].name : "Hub";
    const restarts = Math.max(0, (dayState.opens?.[screen.key] ?? 1) - 1);
    const forFun = !!dayState.results[screen.key]?.done;
    const funRun = dayState.funOpens?.[screen.key] ?? 0;
    const gameSeed = forFun ? seedFor(idx + 1 + 37 * Math.max(1, funRun), new Date(Date.now() + Math.max(1, funRun) * 86_400_000)) : seedFor(idx + 1);
    return (
      <>
        <StatusBar style="light" />
        <Game seed={gameSeed} existing={dayState.results[screen.key]} restarts={restarts} forFun={forFun} nextGameName={nextGameName}
          liveScoreVisible={settings.liveScoreVisible} onToggleLiveScore={toggleLiveScore}
          onGoNext={() => nextKey ? openGame(nextKey) : setScreen({ name: "hub" })}
          onDone={(r, action) => onDone(screen.key, r, action)} onClose={() => setScreen({ name: "hub" })} />
      </>
    );
  }
  if (screen.name === "signin") return (<><StatusBar style="light" /><SignIn onClose={() => setScreen({ name: "hub" })} onLeaderboard={openLeaderboard} onAchievements={showAchievements} onDashboard={showGameCenterDashboard} /></>);

  return (
    <>
      <StatusBar style="light" />
      <Hub day={day} dayState={dayState} stats={stats}
        onPlay={openGame}
        onSignIn={() => setScreen({ name: "signin" })}
        onLeaderboard={openLeaderboard}
        onAchievements={showAchievements}
        onDashboard={showGameCenterDashboard} />
    </>
  );
}
