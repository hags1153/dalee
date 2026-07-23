import React, { useMemo, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { ScreenBG, Header, Keyboard, GradientButton, GameIntro, TimerBadge, useStopwatch, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { pick } from "../daily";
import { wordleScore, timeBonus, applyRestarts } from "../scoring";
import { WORDLE_ANSWERS, DICT5 } from "../wordbank";
import { GameProps } from "./types";

type St = "correct" | "present" | "absent";
const LEN = 5, MAX = 6;
const { width } = Dimensions.get("window");
const TILE = Math.min(56, Math.floor((width - 52) / LEN) - 6);
const G = games.wordle;

function evaluate(guess: string, answer: string): St[] {
  const g = guess.split(""), a = answer.split("");
  const res: St[] = Array(LEN).fill("absent"); const used = Array(LEN).fill(false);
  for (let i = 0; i < LEN; i++) if (g[i] === a[i]) { res[i] = "correct"; used[i] = true; }
  for (let i = 0; i < LEN; i++) if (res[i] !== "correct")
    for (let j = 0; j < LEN; j++) if (!used[j] && g[i] === a[j]) { res[i] = "present"; used[j] = true; break; }
  return res;
}
const col = (s: St) => s === "correct" ? C.correct : s === "present" ? C.present : C.absent;

export default function Wordle({ seed, onDone, onClose, restarts = 0 }: GameProps) {
  const answer = useMemo(() => pick(WORDLE_ANSWERS, seed), [seed]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evals, setEvals] = useState<St[][]>([]);
  const [cur, setCur] = useState("");
  const [state, setState] = useState<"play" | "won" | "lost">("play");
  const [toast, setToast] = useState("");
  const [win, setWin] = useState(false);
  const secs = useStopwatch(state === "play");
  const shake = useRef(new Animated.Value(0)).current;

  const keyStatuses = useMemo(() => {
    const m: Record<string, St> = {}; const rank = { correct: 3, present: 2, absent: 1 };
    guesses.forEach((g, i) => g.split("").forEach((ch, j) => { const s = evals[i][j]; if (!m[ch] || rank[s] > rank[m[ch]]) m[ch] = s; }));
    return m as Record<string, "correct" | "present" | "absent">;
  }, [guesses, evals]);

  const flash = (m: string, w = false) => { setWin(w); setToast(m); setTimeout(() => setToast(""), 1300); };
  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };

  const submit = useCallback(() => {
    if (state !== "play") return;
    if (cur.length !== LEN) { flash("Not enough letters"); return doShake(); }
    if (!DICT5.has(cur.toLowerCase())) { flash("Not in word list"); return doShake(); }
    const ev = evaluate(cur, answer);
    const ng = [...guesses, cur], ne = [...evals, ev];
    setGuesses(ng); setEvals(ne); setCur("");
    const won = ev.every((s) => s === "correct");
    const lost = !won && ng.length >= MAX;
    if (won) { haptic.success(); const score = applyRestarts(wordleScore(ng.length, true) + timeBonus(secs), restarts); setState("won"); flash(`Solved in ${secs}s!  +${score}`, true); setTimeout(() => onDone({ done: true, won: true, score, guesses: ng.length }), 1200); }
    else if (lost) { haptic.error(); setState("lost"); flash(answer); setTimeout(() => onDone({ done: true, won: false, score: 0, guesses: MAX }), 1400); }
  }, [state, cur, answer, guesses, evals, onDone, secs, restarts]);

  const onKey = (k: string) => {
    if (state !== "play") return;
    if (k === "↵") return submit();
    if (k === "⌫") return setCur((c) => c.slice(0, -1));
    setCur((c) => (c.length < LEN ? c + k : c));
  };

  const rows = Array.from({ length: MAX }, (_, r) =>
    r < guesses.length ? { l: guesses[r].split(""), e: evals[r] } :
    r === guesses.length ? { l: cur.padEnd(LEN).split(""), e: [] as St[] } :
    { l: Array(LEN).fill(" "), e: [] as St[] });

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Wordle" subtitle="Guess the 5-letter word" onClose={onClose} right={<TimerBadge seconds={secs} />} />
        <GameIntro text={games.wordle.desc} />
        {!!toast && <View style={[styles.toast, win && styles.toastWin]}><Text style={[styles.toastT, win && styles.toastTWin]}>{toast}</Text></View>}
        <View style={styles.grid}>
          {rows.map((row, r) => {
            const active = r === guesses.length && state === "play";
            return (
              <Animated.View key={r} style={[styles.row, active ? { transform: [{ translateX: shake }] } : null]}>
                {row.l.map((ch, i) => {
                  const s = row.e[i]; const filled = ch.trim().length > 0;
                  return (
                    <View key={i} style={[styles.tile,
                      s ? { backgroundColor: col(s), borderColor: col(s) }
                        : filled ? { backgroundColor: C.surfaceHi, borderColor: C.accent }
                        : { backgroundColor: "transparent", borderColor: C.hairline }]}>
                      <Text style={styles.tileT}>{ch.trim()}</Text>
                    </View>
                  );
                })}
              </Animated.View>
            );
          })}
        </View>
        <View style={{ marginTop: "auto", gap: 12, paddingBottom: 14 }}>
          <GradientButton label="SUBMIT" colors={G.grad as any} onPress={submit} disabled={cur.length !== LEN || state !== "play"} />
          <Keyboard onKey={onKey} statuses={keyStatuses} showEnter={false} />
        </View>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  grid: { alignItems: "center", gap: 7, marginTop: 8 },
  row: { flexDirection: "row", gap: 7 },
  tile: { width: TILE, height: TILE, borderWidth: 2, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  tileT: { color: "#fff", fontSize: TILE * 0.46, fontWeight: "700", fontFamily: tileFont, textAlign: "center", includeFontPadding: false },
  toast: { position: "absolute", top: 96, alignSelf: "center", zIndex: 10, backgroundColor: C.text, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  toastT: { color: C.bg0, fontWeight: "800" },
  toastWin: { backgroundColor: C.correct },
  toastTWin: { color: "#fff", fontSize: 15 },
});
