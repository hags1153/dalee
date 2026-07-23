import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { ScreenBG, Header, GradientButton, GhostButton, GameIntro, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { pick, shuffle } from "../daily";
import { blitzWordPts as pts, applyRestarts } from "../scoring";
import { BLITZ_BASES, BLITZ_DICT } from "../wordbank";
import { GameProps } from "./types";

const G = games.blitz;
const DURATION = 60;

export default function Blitz({ seed, onDone, onClose, restarts = 0 }: GameProps) {
  const letters = useMemo(() => shuffle(pick(BLITZ_BASES, seed).split(""), seed), [seed]);
  const [used, setUsed] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [flashMsg, setFlashMsg] = useState("");
  const started = useRef(false); const finished = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (time <= 0 && !finished.current) {
      finished.current = true; haptic.success();
      onDone({ done: true, won: found.length > 0, score: applyRestarts(score, restarts) });
    }
  }, [time, score, found.length, onDone, restarts]);

  const word = used.map((i) => letters[i]).join("");
  const flash = (m: string) => { setFlashMsg(m); setTimeout(() => setFlashMsg(""), 900); };
  const tapTile = (i: number) => { if (finished.current || used.includes(i)) return; haptic.tap(); setUsed([...used, i]); };
  const del = () => setUsed(used.slice(0, -1));
  const clear = () => setUsed([]);
  const enter = () => {
    if (finished.current) return;
    const w = word.toLowerCase();
    if (w.length < 3) return flash("3+ letters");
    if (found.includes(w)) { flash("Already found"); return clear(); }
    if (!BLITZ_DICT.has(w)) { haptic.error(); flash("Not a word"); return clear(); }
    const p = pts(w.length); setFound([w, ...found]); setScore((s) => s + p); flash(`+${p}`); haptic.tap("medium"); clear();
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Blitz" subtitle="Most words in 60s" onClose={onClose} right={<Text style={styles.score}>{score}</Text>} />
        <GameIntro text={games.blitz.desc} />
        <View style={styles.timerTrack}><View style={[styles.timerFill, { width: `${(time / DURATION) * 100}%`, backgroundColor: time <= 10 ? C.present : G.hue }]} /></View>
        <Text style={[styles.time, time <= 10 && { color: C.present }]}>{time}s</Text>

        <View style={styles.current}><Text style={styles.currentT}>{word || " "}</Text>{!!flashMsg && <Text style={styles.flash}>{flashMsg}</Text>}</View>

        <View style={styles.tiles}>
          {letters.map((ch, i) => (
            <Pressable key={i} onPress={() => tapTile(i)} disabled={used.includes(i)} style={[styles.tile, used.includes(i) && styles.tileUsed]}>
              <Text style={[styles.tileT, used.includes(i) && { color: C.textFaint }]}>{ch}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
          <GhostButton label="⌫" onPress={del} style={{ flex: 1 }} />
          <GradientButton label="Enter" colors={G.grad as any} onPress={enter} style={{ flex: 2 }} />
        </View>

        <Text style={styles.foundH}>{found.length} words</Text>
        <ScrollView style={{ flex: 1, marginTop: 6 }} contentContainerStyle={styles.foundWrap}>
          {found.map((w) => <View key={w} style={styles.foundChip}><Text style={styles.foundT}>{w}</Text></View>)}
        </ScrollView>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  score: { color: G.hue, fontSize: 20, fontWeight: "800" },
  timerTrack: { height: 8, borderRadius: 4, backgroundColor: C.hairline, marginTop: 8, overflow: "hidden" },
  timerFill: { height: 8, borderRadius: 4 },
  time: { color: C.textDim, textAlign: "center", fontWeight: "700", marginTop: 6 },
  current: { height: 60, alignItems: "center", justifyContent: "center", marginTop: 14 },
  currentT: { color: C.text, fontSize: 32, fontWeight: "700", fontFamily: tileFont, letterSpacing: 4 },
  flash: { position: "absolute", right: 8, color: C.correct, fontWeight: "800", fontSize: 18 },
  tiles: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 9, marginTop: 8 },
  tile: { width: 52, height: 60, borderRadius: radius.md, backgroundColor: C.surfaceHi, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.hairline },
  tileUsed: { backgroundColor: "transparent", borderStyle: "dashed" },
  tileT: { color: "#fff", fontSize: 24, fontWeight: "700", fontFamily: tileFont, textAlign: "center", width: "100%" },
  foundH: { color: C.textFaint, fontWeight: "700", marginTop: 16 },
  foundWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 16 },
  foundChip: { backgroundColor: C.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: C.hairline },
  foundT: { color: C.textDim, fontWeight: "700", textTransform: "uppercase", fontSize: 13 },
});
