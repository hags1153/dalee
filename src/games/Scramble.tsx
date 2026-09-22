import React, { useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from "react-native";
import { ScreenBG, Header, GradientButton, GhostButton, GameIntro, TimerBadge, LiveScoreToggle, FunBanner, ResultPanel, useStopwatch, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { shuffle } from "../daily";
import { scrambleScore, timeBonus, applyRestarts, SCRAMBLE_HINT, SCRAMBLE_WRONG } from "../scoring";
import { scrambleAnswer } from "../puzzles";
import { GameProps } from "./types";

const G = games.scramble;

export default function Scramble({ seed, onDone, onClose, onGoNext, restarts = 0, forFun = false, nextGameName, liveScoreVisible = true, onToggleLiveScore }: GameProps) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 680;
  const finish = (r: Parameters<typeof onDone>[0], action: "home" | "next" = "home") => (forFun ? (action === "next" ? onGoNext?.() || onClose() : onClose()) : onDone(r, action));
  const answer = useMemo(() => scrambleAnswer(seed), [seed]);
  const slotGap = compact ? 5 : 8;
  const slotSize = Math.max(34, Math.min(54, Math.floor((width - 40 - slotGap * (answer.length - 1)) / answer.length)));
  const chipSize = compact ? 50 : 58;
  const pool = useMemo(() => {
    let s = shuffle(answer.split(""), seed);
    if (s.join("") === answer) s = shuffle(answer.split(""), seed + 7);
    return s;
  }, [answer, seed]);
  const [placed, setPlaced] = useState<number[]>([]); // indices into pool
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"play" | "won">("play");
  const [toast, setToast] = useState("");
  const [win, setWin] = useState(false);
  const [result, setResult] = useState<{ title: string; detail: string; score: number; won: boolean; breakdown: { label: string; value: number | string; tone?: "good" | "bad" | "neutral" }[]; payload: Parameters<typeof onDone>[0] } | null>(null);
  const secs = useStopwatch(state === "play");
  const shake = useRef(new Animated.Value(0)).current;
  const liveScore = result?.score ?? applyRestarts(scrambleScore(wrong, hints) + timeBonus(secs), restarts);

  const usedSet = new Set(placed);
  const built = placed.map((i) => pool[i]).join("");
  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };
  const flash = (m: string, w = false) => { setWin(w); setToast(m); if (!w) setTimeout(() => setToast(""), 1000); };

  const place = (i: number) => { if (state !== "play" || usedSet.has(i) || placed.length >= answer.length) return; haptic.tap(); setPlaced([...placed, i]); };
  const back = () => { if (!placed.length) return; haptic.tap(); setPlaced(placed.slice(0, -1)); };
  const hint = () => {
    if (state !== "play") return;
    const pos = placed.length; if (pos >= answer.length) return;
    // find an unused pool tile matching the needed letter
    const need = answer[pos];
    const idx = pool.findIndex((ch, i) => ch === need && !usedSet.has(i));
    if (idx >= 0) { setHints((h) => h + 1); setPlaced([...placed, idx]); haptic.tap("medium"); flash(`−${SCRAMBLE_HINT} · hint`); }
  };
  const submit = () => {
    if (state !== "play" || built.length !== answer.length) return;
    if (built === answer) {
      haptic.success(); setState("won");
      const score = applyRestarts(scrambleScore(wrong, hints) + timeBonus(secs), restarts);
      const rawPuzzleScore = 1325 - wrong * SCRAMBLE_WRONG - hints * SCRAMBLE_HINT;
      const floorBoost = Math.max(0, scrambleScore(wrong, hints) - rawPuzzleScore);
      const elapsed = Math.floor(secs);
      flash(forFun ? `Nice, ${elapsed}s!` : `Nice, ${elapsed}s!  +${score}`, true);
      setResult({
        title: "Unscrambled",
        detail: `${answer} in ${elapsed}s`,
        score,
        won: true,
        breakdown: [
          { label: "Base solve", value: 1325, tone: "good" },
          ...(wrong ? [{ label: "Wrong guesses", value: `-${wrong * SCRAMBLE_WRONG}`, tone: "bad" as const }] : []),
          ...(hints ? [{ label: "Hints", value: `-${hints * SCRAMBLE_HINT}`, tone: "bad" as const }] : []),
          ...(floorBoost ? [{ label: "Minimum floor", value: floorBoost, tone: "good" as const }] : []),
          { label: "Time bonus", value: timeBonus(secs), tone: "good" },
          ...(restarts ? [{ label: "Restart penalty", value: `-${restarts * 100}`, tone: "bad" as const }] : []),
        ],
        payload: { done: true, won: true, score, seconds: secs, wrong, hints },
      });
    } else { setWrong((w) => w + 1); doShake(); flash(`−${SCRAMBLE_WRONG} · wrong`); }
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Scramble" subtitle="Unscramble the word" onClose={onClose} right={<><LiveScoreToggle points={liveScore} visible={liveScoreVisible} onToggle={onToggleLiveScore} /><TimerBadge seconds={secs} /></>} />
        <GameIntro text={games.scramble.desc} />
        {forFun && <FunBanner />}
        {!!toast && <View style={[styles.toast, win && styles.toastWin]}><Text style={styles.toastT}>{toast}</Text></View>}
        <Text style={styles.hint}>{answer.length} letters</Text>

        <Animated.View style={[styles.slots, { gap: slotGap, marginTop: compact ? 16 : 30, transform: [{ translateX: shake }] }]}>
          {Array.from({ length: answer.length }).map((_, i) => (
            <View key={i} style={[styles.slot, { width: slotSize, height: slotSize + 8, borderColor: state === "won" ? C.correct : C.hairline, backgroundColor: state === "won" ? C.correct : "transparent" }]}>
              <Text style={[styles.slotT, { fontSize: Math.min(28, slotSize * 0.52) }]}>{built[i] || ""}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={[styles.pool, { marginTop: compact ? 24 : 48, gap: compact ? 8 : 10 }]}>
          {pool.map((ch, i) => (
            <Pressable key={i} onPress={() => place(i)} disabled={usedSet.has(i)}
              style={[styles.chip, { width: chipSize, height: chipSize + 8 }, usedSet.has(i) && styles.chipUsed]}>
              <Text style={[styles.chipT, { fontSize: compact ? 24 : 28 }, usedSet.has(i) && { color: C.textFaint }]}>{ch}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: "auto", gap: compact ? 8 : 12, paddingBottom: compact ? 8 : 16 }}>
          <View style={{ flexDirection: "row", gap: compact ? 8 : 12 }}>
            <GhostButton label="Delete" onPress={back} style={{ flex: 1 }} />
            <GhostButton label={`Hint -${SCRAMBLE_HINT}`} onPress={hint} style={{ flex: 1 }} />
          </View>
          <GradientButton label="Submit" colors={G.grad as any} onPress={submit} disabled={built.length !== answer.length} />
        </View>
        {result && <ResultPanel title={result.title} detail={result.detail} score={result.score} won={result.won} forFun={forFun} breakdown={result.breakdown} nextLabel={nextGameName ? `Continue to ${nextGameName}` : "Continue"} onContinue={() => finish(result.payload, "next")} onHome={() => finish(result.payload, "home")} />}
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 42 },
  toast: { position: "absolute", top: 96, alignSelf: "center", zIndex: 10, backgroundColor: C.surfaceHi, borderWidth: 1, borderColor: C.hairline, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  toastWin: { backgroundColor: C.correct, borderColor: C.correct },
  toastT: { color: "#fff", fontWeight: "800" },
  hint: { color: C.textFaint, textAlign: "center", marginTop: 8, fontWeight: "600" },
  slots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 30 },
  slot: { borderRadius: radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  slotT: { color: "#fff", fontWeight: "700", fontFamily: tileFont, textAlign: "center", width: "100%" },
  pool: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 48 },
  chip: { borderRadius: radius.md, backgroundColor: C.surfaceHi, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.hairline },
  chipUsed: { backgroundColor: "transparent", borderStyle: "dashed" },
  chipT: { color: "#fff", fontWeight: "700", fontFamily: tileFont, textAlign: "center", width: "100%" },
});
