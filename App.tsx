import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Status, WORD_LEN, MAX_GUESSES, dailyAnswer, dayIndex, evaluate,
  mergeKeyStatuses, isValidGuess,
} from "./src/logic";

const C = {
  bg: "#121213", text: "#ffffff", border: "#3a3a3c",
  correct: "#538d4e", present: "#b59f3b", absent: "#3a3a3c", key: "#818384", muted: "#818384",
};
const statusColor = (s: Status) =>
  s === "correct" ? C.correct : s === "present" ? C.present : s === "absent" ? C.absent : "transparent";

const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "⏎ZXCVBNM⌫"];
const { width } = Dimensions.get("window");
const TILE = Math.min(58, Math.floor((width - 48) / WORD_LEN) - 6);

type Stats = { streak: number; maxStreak: number; played: number; wins: number; lastDay: number };
type Board = { guesses: string[]; evals: Status[][]; state: "playing" | "won" | "lost"; counted: boolean };

const emptyBoard = (): Board => ({ guesses: [], evals: [], state: "playing", counted: false });
const emptyStats = (): Stats => ({ streak: 0, maxStreak: 0, played: 0, wins: 0, lastDay: -999 });

export default function App() {
  const di = useMemo(() => dayIndex(), []);
  const answer = useMemo(() => dailyAnswer(), []);
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [stats, setStats] = useState<Stats>(emptyStats());
  const [current, setCurrent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [b, st] = await Promise.all([
          AsyncStorage.getItem(`board:${di}`),
          AsyncStorage.getItem("stats"),
        ]);
        if (b) setBoard(JSON.parse(b));
        if (st) setStats(JSON.parse(st));
      } catch {}
      setLoaded(true);
    })();
  }, [di]);

  const persistBoard = useCallback((b: Board) => { AsyncStorage.setItem(`board:${di}`, JSON.stringify(b)).catch(() => {}); }, [di]);
  const persistStats = useCallback((st: Stats) => { AsyncStorage.setItem("stats", JSON.stringify(st)).catch(() => {}); }, []);

  const keyStatuses = useMemo(() => {
    let map: Record<string, Status> = {};
    board.guesses.forEach((g, i) => { map = mergeKeyStatuses(map, g, board.evals[i]); });
    return map;
  }, [board]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1400); };

  const submit = useCallback(() => {
    if (board.state !== "playing") return;
    if (current.length !== WORD_LEN) return flash("Not enough letters");
    if (!isValidGuess(current)) return flash("Letters only");
    const ev = evaluate(current, answer);
    const guesses = [...board.guesses, current.toUpperCase()];
    const evals = [...board.evals, ev];
    const won = ev.every((x) => x === "correct");
    const lost = !won && guesses.length >= MAX_GUESSES;
    const next: Board = { guesses, evals, state: won ? "won" : lost ? "lost" : "playing", counted: board.counted };

    if ((won || lost) && !board.counted) {
      const ns: Stats = { ...stats };
      ns.played += 1;
      if (won) { ns.wins += 1; ns.streak = stats.lastDay === di - 1 ? stats.streak + 1 : 1; }
      else ns.streak = 0;
      ns.maxStreak = Math.max(ns.maxStreak, ns.streak);
      ns.lastDay = di;
      next.counted = true;
      setStats(ns); persistStats(ns);
      flash(won ? `Nice! Streak ${ns.streak} 🔥` : `The word was ${answer}`);
    }
    setBoard(next); persistBoard(next); setCurrent("");
  }, [board, current, answer, stats, di, persistBoard, persistStats]);

  const onKey = useCallback((k: string) => {
    if (board.state !== "playing") return;
    if (k === "⏎") return submit();
    if (k === "⌫") return setCurrent((c) => c.slice(0, -1));
    setCurrent((c) => (c.length < WORD_LEN ? c + k : c));
  }, [board.state, submit]);

  const rows = Array.from({ length: MAX_GUESSES }, (_, r) => {
    if (r < board.guesses.length) return { letters: board.guesses[r].split(""), evals: board.evals[r] };
    if (r === board.guesses.length) return { letters: current.padEnd(WORD_LEN).split(""), evals: Array(WORD_LEN).fill("empty") as Status[] };
    return { letters: Array(WORD_LEN).fill(" "), evals: Array(WORD_LEN).fill("empty") as Status[] };
  });

  if (!loaded) return <View style={s.app}><StatusBar style="light" /></View>;

  return (
    <View style={s.app}>
      <StatusBar style="light" />
      <View style={s.header}>
        <Text style={s.title}>DALEE</Text>
        <Text style={s.sub}>#{di + 1} · streak {stats.streak}🔥 · best {stats.maxStreak}</Text>
      </View>

      {!!toast && <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>}

      <View style={s.grid}>
        {rows.map((row, r) => (
          <View key={r} style={s.row}>
            {row.letters.map((ch, i) => {
              const st = row.evals[i];
              const filled = ch.trim().length > 0;
              return (
                <View key={i} style={[s.tile, {
                  backgroundColor: statusColor(st),
                  borderColor: st === "empty" ? (filled ? "#565758" : C.border) : statusColor(st),
                }]}>
                  <Text style={s.tileText}>{ch.trim().toUpperCase()}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {board.state !== "playing" && (
        <Text style={s.done}>{board.state === "won" ? "Solved!" : `Answer: ${answer}`} · come back tomorrow</Text>
      )}

      <View style={s.kb}>
        {KB_ROWS.map((r, ri) => (
          <View key={ri} style={s.kbRow}>
            {r.split("").map((k) => {
              const st = keyStatuses[k];
              const wide = k === "⏎" || k === "⌫";
              return (
                <Pressable key={k} onPress={() => onKey(k)}
                  style={[s.key, wide && s.keyWide, st && st !== "empty" ? { backgroundColor: statusColor(st) } : null]}>
                  <Text style={s.keyText}>{k}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg, alignItems: "center", paddingTop: Platform.OS === "android" ? 40 : 54 },
  header: { alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#2a2a2c", width: "100%" },
  title: { color: C.text, fontSize: 26, fontWeight: "800", letterSpacing: 3 },
  sub: { color: C.muted, fontSize: 12, marginTop: 2 },
  toast: { position: "absolute", top: 110, backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, zIndex: 10 },
  toastText: { color: "#121213", fontWeight: "700" },
  grid: { flex: 1, justifyContent: "center", gap: 6 },
  row: { flexDirection: "row", gap: 6 },
  tile: { width: TILE, height: TILE, borderWidth: 2, alignItems: "center", justifyContent: "center", borderRadius: 4 },
  tileText: { color: C.text, fontSize: TILE * 0.5, fontWeight: "800" },
  done: { color: C.muted, marginBottom: 8, fontWeight: "600" },
  kb: { width: "100%", paddingHorizontal: 4, paddingBottom: 16, gap: 6 },
  kbRow: { flexDirection: "row", justifyContent: "center", gap: 5 },
  key: { backgroundColor: C.key, minWidth: 30, flex: 1, maxWidth: 42, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 5 },
  keyWide: { flex: 1.5, maxWidth: 60 },
  keyText: { color: C.text, fontWeight: "700", fontSize: 16 },
});
