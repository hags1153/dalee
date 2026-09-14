import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { ScreenBG, Header, GradientButton, GhostButton, GameIntro, FunBanner, PointsPill, ResultPanel, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { shuffle } from "../daily";
import { blitzWordPts as pts, applyRestarts } from "../scoring";
import { BLITZ_DICT } from "../wordbank";
import { blitzLetters } from "../puzzles";
import { GameProps } from "./types";

const G = games.blitz;
const DURATION = 60;

export default function Blitz({ seed, onDone, onClose, restarts = 0, forFun = false, nextGameName }: GameProps) {
  const letters = useMemo(() => shuffle(blitzLetters(seed).split(""), seed), [seed]);
  const [used, setUsed] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [flashMsg, setFlashMsg] = useState("");
  const [state, setState] = useState<"ready" | "play" | "done">("ready");
  const [result, setResult] = useState<{ title: string; detail: string; score: number; won: boolean; payload: Parameters<typeof onDone>[0] } | null>(null);
  const finished = useRef(false);
  const liveScore = result?.score ?? applyRestarts(score, restarts);

  useEffect(() => {
    if (state !== "play") return;
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [state]);
  useEffect(() => {
    if (time <= 0 && !finished.current) {
      finished.current = true;
      setState("done");
      haptic.success();
      const finalScore = applyRestarts(score, restarts);
      setResult({
        title: found.length ? "Blitz Complete" : "Time",
        detail: `${found.length} words found`,
        score: finalScore,
        won: found.length > 0,
        payload: { done: true, won: found.length > 0, score: finalScore },
      });
    }
  }, [time, score, found.length, restarts]);

  const word = used.map((i) => letters[i]).join("");
  const flash = (m: string) => { setFlashMsg(m); setTimeout(() => setFlashMsg(""), 900); };
  const start = () => { if (state === "ready") setState("play"); };
  const tapTile = (i: number) => { if (finished.current || used.includes(i)) return; start(); haptic.tap(); setUsed([...used, i]); };
  const del = () => setUsed(used.slice(0, -1));
  const clear = () => setUsed([]);
  const enter = () => {
    if (finished.current) return;
    start();
    const w = word.toLowerCase();
    if (w.length < 3) return flash("3+ letters");
    if (found.includes(w)) { flash("Already found"); return clear(); }
    if (!BLITZ_DICT.has(w)) { haptic.error(); flash("Not a word"); return clear(); }
    const p = pts(w.length); setFound([w, ...found]); setScore((s) => s + p); flash(`+${p}`); haptic.tap("medium"); clear();
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Blitz" subtitle="Most words in 60s" onClose={onClose} right={<PointsPill points={liveScore} />} />
        <GameIntro text={games.blitz.desc} />
        {forFun && <FunBanner />}
        {state === "ready" && (
          <View style={styles.ready}>
            <Text style={styles.readyT}>Ready?</Text>
            <Text style={styles.readySub}>The 60-second clock starts when you tap Start or choose your first letter.</Text>
            <GradientButton label="Start Blitz" colors={G.grad as any} onPress={start} />
          </View>
        )}
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
        {result && <ResultPanel title={result.title} detail={result.detail} score={result.score} won={result.won} forFun={forFun} nextLabel={nextGameName ? `Continue to ${nextGameName}` : "Continue"} onContinue={() => forFun ? onClose() : onDone(result.payload)} />}
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  ready: { backgroundColor: C.surface, borderColor: G.hue + "66", borderWidth: 1, borderRadius: radius.md, padding: 16, gap: 10, marginTop: 14 },
  readyT: { color: C.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  readySub: { color: C.textDim, fontSize: 14, fontWeight: "600", lineHeight: 20, textAlign: "center" },
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
