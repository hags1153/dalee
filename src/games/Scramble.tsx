import React, { useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { ScreenBG, Header, GradientButton, GhostButton, haptic } from "../ui";
import { palette as C, games, radius } from "../theme";
import { pick, shuffle } from "../daily";
import { SCRAMBLE_WORDS } from "../wordbank";
import { GameProps } from "./types";

const G = games.scramble;

export default function Scramble({ seed, onDone, onClose }: GameProps) {
  const answer = useMemo(() => pick(SCRAMBLE_WORDS, seed), [seed]);
  const pool = useMemo(() => {
    let s = shuffle(answer.split(""), seed);
    if (s.join("") === answer) s = shuffle(answer.split(""), seed + 7);
    return s;
  }, [answer, seed]);
  const [placed, setPlaced] = useState<number[]>([]); // indices into pool
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"play" | "won">("play");
  const shake = useRef(new Animated.Value(0)).current;

  const usedSet = new Set(placed);
  const built = placed.map((i) => pool[i]).join("");
  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };

  const place = (i: number) => { if (state !== "play" || usedSet.has(i) || placed.length >= answer.length) return; haptic.tap(); setPlaced([...placed, i]); };
  const back = () => { if (!placed.length) return; haptic.tap(); setPlaced(placed.slice(0, -1)); };
  const hint = () => {
    if (state !== "play") return;
    const pos = placed.length; if (pos >= answer.length) return;
    // find an unused pool tile matching the needed letter
    const need = answer[pos];
    const idx = pool.findIndex((ch, i) => ch === need && !usedSet.has(i));
    if (idx >= 0) { setHints((h) => h + 1); setPlaced([...placed, idx]); haptic.tap("medium"); }
  };
  const submit = () => {
    if (state !== "play" || built.length !== answer.length) return;
    if (built === answer) {
      haptic.success(); setState("won");
      const score = Math.max(25, 100 - wrong * 15 - hints * 20);
      setTimeout(() => onDone({ done: true, won: true, score }), 850);
    } else { setWrong((w) => w + 1); doShake(); }
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Scramble" subtitle="Unscramble the word" onClose={onClose} />
        <Text style={styles.hint}>{answer.length} letters</Text>

        <Animated.View style={[styles.slots, { transform: [{ translateX: shake }] }]}>
          {Array.from({ length: answer.length }).map((_, i) => (
            <View key={i} style={[styles.slot, { borderColor: state === "won" ? C.correct : C.hairline, backgroundColor: state === "won" ? C.correct : "transparent" }]}>
              <Text style={styles.slotT}>{built[i] || ""}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.pool}>
          {pool.map((ch, i) => (
            <Pressable key={i} onPress={() => place(i)} disabled={usedSet.has(i)}
              style={[styles.chip, usedSet.has(i) && styles.chipUsed]}>
              <Text style={[styles.chipT, usedSet.has(i) && { color: C.textFaint }]}>{ch}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: "auto", gap: 12, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <GhostButton label="⌫ Delete" onPress={back} style={{ flex: 1 }} />
            <GhostButton label="💡 Hint" onPress={hint} style={{ flex: 1 }} />
          </View>
          <GradientButton label="Submit" colors={G.grad as any} onPress={submit} disabled={built.length !== answer.length} />
        </View>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  hint: { color: C.textFaint, textAlign: "center", marginTop: 8, fontWeight: "600" },
  slots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 30 },
  slot: { width: 54, height: 62, borderRadius: radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  slotT: { color: "#fff", fontSize: 30, fontWeight: "800" },
  pool: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 48 },
  chip: { width: 58, height: 66, borderRadius: radius.md, backgroundColor: C.surfaceHi, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.hairline },
  chipUsed: { backgroundColor: "transparent", borderStyle: "dashed" },
  chipT: { color: "#fff", fontSize: 30, fontWeight: "800" },
});
