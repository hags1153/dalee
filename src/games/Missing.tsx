import React, { useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { ScreenBG, Header, Keyboard, GradientButton, GhostButton, haptic } from "../ui";
import { palette as C, games, radius } from "../theme";
import { pick, seededRng } from "../daily";
import { MISSING } from "../wordbank";
import { GameProps } from "./types";

const G = games.missing;

export default function Missing({ seed, onDone, onClose }: GameProps) {
  const puzzle = useMemo(() => pick(MISSING, seed), [seed]);
  const word = puzzle.word;
  // deterministically choose which positions are blank (~45%, at least 2)
  const blanks = useMemo(() => {
    const r = seededRng(seed + 3); const idx: number[] = [];
    word.split("").forEach((_, i) => { if (r() < 0.45) idx.push(i); });
    while (idx.length < 2) { const i = Math.floor(r() * word.length); if (!idx.includes(i)) idx.push(i); }
    return idx.sort((a, b) => a - b);
  }, [word, seed]);

  const [fills, setFills] = useState<string[]>([]); // letters typed for blanks, in order
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"play" | "won">("play");
  const shake = useRef(new Animated.Value(0)).current;
  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };

  const display = word.split("").map((ch, i) => {
    const bi = blanks.indexOf(i);
    return bi === -1 ? { ch, blank: false } : { ch: fills[bi] || "", blank: true };
  });

  const onKey = (k: string) => {
    if (state !== "play") return;
    if (k === "⌫") return setFills((f) => f.slice(0, -1));
    if (k === "↵") return submit();
    if (/[A-Z]/.test(k) && fills.length < blanks.length) setFills((f) => [...f, k]);
  };
  const hint = () => {
    if (state !== "play" || fills.length >= blanks.length) return;
    const pos = fills.length; setHints((h) => h + 1); setFills((f) => [...f, word[blanks[pos]]]); haptic.tap("medium");
  };
  const submit = () => {
    if (state !== "play" || fills.length !== blanks.length) return;
    const ok = blanks.every((p, k) => fills[k] === word[p]);
    if (ok) { haptic.success(); setState("won"); const score = Math.max(25, 100 - wrong * 15 - hints * 25); setTimeout(() => onDone({ done: true, won: true, score }), 850); }
    else { setWrong((w) => w + 1); doShake(); setFills([]); }
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Missing" subtitle="Fill in the blanks" onClose={onClose} />
        <View style={styles.hintCard}><Text style={styles.hintT}>💡 {puzzle.hint}</Text></View>
        <Animated.View style={[styles.word, { transform: [{ translateX: shake }] }]}>
          {display.map((d, i) => (
            <View key={i} style={[styles.tile, d.blank ? { borderColor: state === "won" ? C.correct : G.hue, backgroundColor: state === "won" ? C.correct : "transparent" } : { borderColor: "transparent", backgroundColor: C.surfaceHi }]}>
              <Text style={styles.tileT}>{d.ch}</Text>
            </View>
          ))}
        </Animated.View>
        <View style={{ marginTop: "auto", gap: 12, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <GhostButton label="💡 Hint" onPress={hint} style={{ flex: 1 }} />
            <GradientButton label="Submit" colors={G.grad as any} onPress={submit} disabled={fills.length !== blanks.length} style={{ flex: 1 }} />
          </View>
          <Keyboard onKey={onKey} />
        </View>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  hintCard: { backgroundColor: C.surface, borderRadius: radius.md, padding: 16, marginTop: 16, borderWidth: 1, borderColor: C.hairline },
  hintT: { color: C.text, fontSize: 16, fontWeight: "600", textAlign: "center" },
  word: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 40 },
  tile: { width: 52, height: 60, borderRadius: radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tileT: { color: "#fff", fontSize: 28, fontWeight: "800" },
});
