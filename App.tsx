import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { palette as C, CIRCUIT, GameKey } from "./src/theme";
import { dayIndex, seedFor } from "./src/daily";
import { DayState, Stats, GameResult, loadDay, saveDay, loadStats, commitCircuit, circuitComplete } from "./src/storage";
import Hub from "./src/Hub";
import SignIn from "./src/SignIn";
import Wordle from "./src/games/Wordle";
import Scramble from "./src/games/Scramble";
import Ladder from "./src/games/Ladder";
import Missing from "./src/games/Missing";
import Blitz from "./src/games/Blitz";
import { GameProps } from "./src/games/types";

const GAMES: Record<GameKey, React.ComponentType<GameProps>> = {
  wordle: Wordle, scramble: Scramble, ladder: Ladder, missing: Missing, blitz: Blitz,
};

type Screen = { name: "hub" } | { name: "game"; key: GameKey } | { name: "signin" };

export default function App() {
  const day = dayIndex();
  const [screen, setScreen] = useState<Screen>({ name: "hub" });
  const [dayState, setDayState] = useState<DayState>({ day, results: {} });
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { (async () => { setDayState(await loadDay(day)); setStats(await loadStats()); })(); }, [day]);

  const onDone = useCallback(async (key: GameKey, result: GameResult) => {
    const prev = dayState.results[key];
    // keep the best score if replayed
    const merged = !prev || result.score > (prev.score || 0) ? result : prev;
    const next: DayState = { ...dayState, results: { ...dayState.results, [key]: merged } };
    setDayState(next); await saveDay(next);
    if (circuitComplete(next)) setStats(await commitCircuit(day, next));
    setScreen({ name: "hub" });
  }, [dayState, day]);

  if (!stats) return <View style={{ flex: 1, backgroundColor: C.bg1 }}><StatusBar style="light" /></View>;

  if (screen.name === "game") {
    const Game = GAMES[screen.key];
    const idx = CIRCUIT.indexOf(screen.key);
    return (
      <>
        <StatusBar style="light" />
        <Game seed={seedFor(idx + 1)} existing={dayState.results[screen.key]}
          onDone={(r) => onDone(screen.key, r)} onClose={() => setScreen({ name: "hub" })} />
      </>
    );
  }
  if (screen.name === "signin") return (<><StatusBar style="light" /><SignIn onClose={() => setScreen({ name: "hub" })} /></>);

  return (
    <>
      <StatusBar style="light" />
      <Hub day={day} dayState={dayState} stats={stats}
        onPlay={(k) => setScreen({ name: "game", key: k })}
        onSignIn={() => setScreen({ name: "signin" })} />
    </>
  );
}
