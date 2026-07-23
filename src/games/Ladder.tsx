import React, { useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, ScrollView } from "react-native";
import { ScreenBG, Header, Keyboard, GradientButton, GameIntro, TimerBadge, useStopwatch, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { pick } from "../daily";
import { ladderScore, timeBonus, applyRestarts } from "../scoring";
import { LADDERS, DICT4 } from "../wordbank";
import { GameProps } from "./types";

const G = games.ladder;
const diffOne = (a: string, b: string) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d === 1; };
const matchCount = (a: string, b: string) => { let m = 0; for (let i = 0; i < a.length; i++) if (a[i] === b[i]) m++; return m; };

export default function Ladder({ seed, onDone, onClose, restarts = 0 }: GameProps) {
  const puzzle = useMemo(() => pick(LADDERS, seed), [seed]);
  const start = puzzle.start.toUpperCase(), end = puzzle.end.toUpperCase();
  const [chain, setChain] = useState<string[]>([start]);
  const [cur, setCur] = useState("");
  const [toast, setToast] = useState("");
  const [win, setWin] = useState(false);
  const [state, setState] = useState<"play" | "won">("play");
  const secs = useStopwatch(state === "play");
  const shake = useRef(new Animated.Value(0)).current;
  const flash = (m: string, w = false) => { setWin(w); setToast(m); setTimeout(() => setToast(""), 1300); };
  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };

  const submit = () => {
    if (state !== "play") return;
    const w = cur.toUpperCase();
    if (w.length !== 4) { flash("4 letters"); return doShake(); }
    const last = chain[chain.length - 1];
    if (!diffOne(w, last)) { flash("Change exactly one letter"); return doShake(); }
    if (!DICT4.has(w.toLowerCase())) { flash("Not a word"); return doShake(); }
    if (chain.includes(w)) { flash("Already used"); return doShake(); }
    const nc = [...chain, w]; setChain(nc); setCur(""); haptic.tap("medium");
    if (w === end) { haptic.success(); setState("won"); const steps = nc.length - 1; const score = applyRestarts(ladderScore(steps) + timeBonus(secs), restarts); flash(`${steps} steps · ${secs}s!  +${score}`, true); setTimeout(() => onDone({ done: true, won: true, score }), 1100); }
  };
  const onKey = (k: string) => { if (state !== "play") return; if (k === "↵") return submit(); if (k === "⌫") return setCur((c) => c.slice(0, -1)); if (/[A-Z]/.test(k) && cur.length < 4) setCur((c) => c + k); };

  const Word = ({ w, tone }: { w: string; tone: "start" | "end" | "step" | "cur" }) => (
    <View style={styles.wrow}>
      {w.padEnd(4).split("").map((ch, i) => {
        const filled = ch.trim().length > 0;
        const st = tone === "end" ? { borderColor: C.correct, backgroundColor: "transparent" }
          : tone === "start" ? { backgroundColor: C.surfaceHi, borderColor: "transparent" }
          : tone === "cur" ? { borderColor: G.hue, backgroundColor: filled ? C.surfaceHi : "transparent" }
          : { backgroundColor: G.hue, borderColor: G.hue };
        return (
          <View key={i} style={[styles.cell, st]}>
            <Text style={styles.cellT}>{ch.trim()}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Ladder" subtitle="Change one letter at a time" onClose={onClose} right={<TimerBadge seconds={secs} />} />
        <GameIntro text={games.ladder.desc} />
        <View style={styles.goal}><Text style={styles.goalT}>{start}</Text><Text style={styles.arrow}>→</Text><Text style={[styles.goalT, { color: C.correct }]}>{end}</Text></View>
        {!!toast && <View style={[styles.toast, win && styles.toastWin]}><Text style={[styles.toastT, win && styles.toastTWin]}>{toast}</Text></View>}
        <ScrollView contentContainerStyle={{ alignItems: "center", gap: 6, paddingVertical: 10 }} style={{ flex: 1 }}>
          {chain.map((w, i) => <Word key={i} w={w} tone={i === 0 ? "start" : w === end ? "end" : "step"} />)}
          {state === "play" && <Animated.View style={{ transform: [{ translateX: shake }] }}><Word w={cur} tone="cur" /></Animated.View>}
          <Text style={styles.match}>{state === "play" ? `${matchCount((cur || chain[chain.length - 1]), end)}/4 letters match the target` : "🏆 You reached the target!"}</Text>
        </ScrollView>
        <View style={{ gap: 12, paddingBottom: 14 }}>
          <GradientButton label="SUBMIT" colors={G.grad as any} onPress={submit} disabled={cur.length !== 4 || state !== "play"} />
          <Keyboard onKey={onKey} showEnter={false} />
        </View>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  goal: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 10 },
  goalT: { color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: 3 },
  arrow: { color: C.textFaint, fontSize: 22 },
  wrow: { flexDirection: "row", gap: 6 },
  cell: { width: 46, height: 50, borderRadius: radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  cellT: { color: "#fff", fontSize: 22, fontWeight: "700", fontFamily: tileFont, textAlign: "center", includeFontPadding: false },
  match: { color: C.textFaint, marginTop: 10, fontWeight: "600" },
  toast: { position: "absolute", top: 108, alignSelf: "center", zIndex: 10, backgroundColor: C.text, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  toastT: { color: C.bg0, fontWeight: "800" },
  toastWin: { backgroundColor: C.correct },
  toastTWin: { color: "#fff" },
});
