import React, { useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, ScrollView } from "react-native";
import { ScreenBG, Header, Keyboard, GradientButton, GhostButton, GameIntro, TimerBadge, LiveScoreToggle, FunBanner, ResultPanel, useStopwatch, haptic } from "../ui";
import { palette as C, games, radius, tileFont } from "../theme";
import { missingScore, timeBonus, applyRestarts, MISSING_HINT, MISSING_WRONG } from "../scoring";
import { miniCrossword } from "../puzzles";
import { MiniCrosswordEntry } from "../wordbank";
import { GameProps } from "./types";

const G = games.missing;
const SIZE = 5;
const cellKey = (row: number, col: number) => `${row},${col}`;

function cellsFor(entry: MiniCrosswordEntry) {
  return Array.from({ length: entry.answer.length }, (_, i) => ({
    row: entry.row + (entry.dir === "down" ? i : 0),
    col: entry.col + (entry.dir === "across" ? i : 0),
    letter: entry.answer[i],
  }));
}

export default function Missing({ seed, onDone, onClose, onGoNext, restarts = 0, forFun = false, nextGameName, liveScoreVisible = true, onToggleLiveScore }: GameProps) {
  const finish = (r: Parameters<typeof onDone>[0], action: "home" | "next" = "home") => (forFun ? (action === "next" ? onGoNext?.() || onClose() : onClose()) : onDone(r, action));
  const puzzle = useMemo(() => miniCrossword(seed), [seed]);
  const entries = puzzle.entries;
  const solution = useMemo(() => {
    const map: Record<string, string> = {};
    puzzle.grid.forEach((row, r) => row.split("").forEach((ch, c) => { if (ch !== ".") map[cellKey(r, c)] = ch; }));
    return map;
  }, [puzzle]);
  const clueNumbers = useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((entry) => { map[cellKey(entry.row, entry.col)] ||= entry.id.replace(/[AD]$/, ""); });
    return map;
  }, [entries]);
  const cellEntries = useMemo(() => {
    const map: Record<string, number[]> = {};
    entries.forEach((entry, index) => {
      cellsFor(entry).forEach((cell) => {
        const key = cellKey(cell.row, cell.col);
        map[key] = [...(map[key] || []), index];
      });
    });
    return map;
  }, [entries]);

  const [fills, setFills] = useState<Record<string, string>>({});
  const [selectedEntry, setSelectedEntry] = useState(0);
  const [selectedCell, setSelectedCell] = useState(cellKey(entries[0].row, entries[0].col));
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(0);
  const [state, setState] = useState<"play" | "won">("play");
  const [toast, setToast] = useState("");
  const [win, setWin] = useState(false);
  const [result, setResult] = useState<{ title: string; detail: string; score: number; won: boolean; breakdown: { label: string; value: number | string; tone?: "good" | "bad" | "neutral" }[]; payload: Parameters<typeof onDone>[0] } | null>(null);
  const secs = useStopwatch(state === "play");
  const shake = useRef(new Animated.Value(0)).current;
  const liveScore = result?.score ?? applyRestarts(missingScore(wrong, hints) + timeBonus(secs), restarts);

  const activeEntry = entries[selectedEntry];
  const activeCells = useMemo(() => cellsFor(activeEntry), [activeEntry]);
  const activeSet = new Set(activeCells.map((cell) => cellKey(cell.row, cell.col)));
  const solvedCells = Object.keys(solution);
  const complete = solvedCells.every((key) => !!fills[key]);

  const doShake = () => { haptic.error(); Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start(); };
  const flash = (m: string, w = false) => { setWin(w); setToast(m); if (!w) setTimeout(() => setToast(""), 1000); };
  const selectEntry = (index: number) => {
    const entry = entries[index];
    const entryCells = cellsFor(entry);
    setSelectedEntry(index);
    const next = entryCells.find((cell) => !fills[cellKey(cell.row, cell.col)]) || entryCells[0];
    setSelectedCell(cellKey(next.row, next.col));
    haptic.tap();
  };
  const selectCell = (key: string) => {
    const owningEntries = cellEntries[key] || [];
    if (owningEntries.length > 1 && key === selectedCell) {
      const current = owningEntries.indexOf(selectedEntry);
      setSelectedEntry(owningEntries[(current + 1) % owningEntries.length]);
    } else if (!owningEntries.includes(selectedEntry) && owningEntries[0] !== undefined) {
      setSelectedEntry(owningEntries[0]);
    }
    setSelectedCell(key);
    haptic.tap();
  };
  const moveFrom = (key: string, direction: 1 | -1) => {
    const index = activeCells.findIndex((cell) => cellKey(cell.row, cell.col) === key);
    const next = activeCells[index + direction];
    if (next) setSelectedCell(cellKey(next.row, next.col));
  };
  const onKey = (k: string) => {
    if (state !== "play") return;
    if (k === "↵") return submit();
    if (k === "⌫") {
      setFills((prev) => {
        const next = { ...prev };
        if (next[selectedCell]) delete next[selectedCell];
        else moveFrom(selectedCell, -1);
        return next;
      });
      return;
    }
    if (!/[A-Z]/.test(k)) return;
    setFills((prev) => ({ ...prev, [selectedCell]: k }));
    moveFrom(selectedCell, 1);
  };
  const hint = () => {
    if (state !== "play") return;
    const target = activeCells.find((cell) => !fills[cellKey(cell.row, cell.col)]) || solvedCells.map((key) => {
      const [row, col] = key.split(",").map(Number);
      return { row, col, letter: solution[key] };
    }).find((cell) => fills[cellKey(cell.row, cell.col)] !== cell.letter);
    if (!target) return;
    const key = cellKey(target.row, target.col);
    setHints((h) => h + 1);
    setFills((prev) => ({ ...prev, [key]: target.letter }));
    setSelectedCell(key);
    haptic.tap("medium");
    flash(`-${MISSING_HINT} · hint`);
  };
  const submit = () => {
    if (state !== "play") return;
    if (!complete) { flash("Keep filling"); return doShake(); }
    const ok = solvedCells.every((key) => fills[key] === solution[key]);
    if (ok) {
      haptic.success();
      setState("won");
      const score = applyRestarts(missingScore(wrong, hints) + timeBonus(secs), restarts);
      const rawPuzzleScore = 1000 - wrong * MISSING_WRONG - hints * MISSING_HINT;
      const floorBoost = Math.max(0, missingScore(wrong, hints) - rawPuzzleScore);
      flash(forFun ? `Solved in ${secs}s!` : `Solved in ${secs}s!  +${score}`, true);
      setResult({
        title: "Crossword Solved",
        detail: `${entries.length} clues in ${secs}s`,
        score,
        won: true,
        breakdown: [
          { label: "Base solve", value: 1000, tone: "good" },
          ...(wrong ? [{ label: "Wrong submits", value: `-${wrong * MISSING_WRONG}`, tone: "bad" as const }] : []),
          ...(hints ? [{ label: "Hints", value: `-${hints * MISSING_HINT}`, tone: "bad" as const }] : []),
          ...(floorBoost ? [{ label: "Minimum floor", value: floorBoost, tone: "good" as const }] : []),
          { label: "Time bonus", value: timeBonus(secs), tone: "good" },
          ...(restarts ? [{ label: "Restart penalty", value: `-${restarts * 100}`, tone: "bad" as const }] : []),
        ],
        payload: { done: true, won: true, score },
      });
    } else {
      setWrong((w) => w + 1);
      doShake();
      flash(`-${MISSING_WRONG} · wrong`);
    }
  };

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Mini Crossword" subtitle="Solve the clues" onClose={onClose} right={<><LiveScoreToggle points={liveScore} visible={liveScoreVisible} onToggle={onToggleLiveScore} /><TimerBadge seconds={secs} /></>} />
        <GameIntro text={games.missing.desc} />
        {forFun && <FunBanner />}
        {!!toast && <View style={[styles.toast, win && styles.toastWin]}><Text style={styles.toastT}>{toast}</Text></View>}

        <Pressable onPress={() => selectEntry(selectedEntry)} style={styles.activeClue}>
          <Text style={styles.activeId}>{activeEntry.id}</Text>
          <Text style={styles.activeText}>{activeEntry.clue}</Text>
        </Pressable>

        <Animated.View style={[styles.board, { transform: [{ translateX: shake }] }]}>
          {Array.from({ length: SIZE }).map((_, row) => (
            <View key={row} style={styles.row}>
              {Array.from({ length: SIZE }).map((__, col) => {
                const key = cellKey(row, col);
                const blocked = !solution[key];
                const active = activeSet.has(key);
                const selected = selectedCell === key;
                return (
                  <Pressable key={key} disabled={blocked || state !== "play"} onPress={() => selectCell(key)}
                    style={[styles.cell, blocked && styles.block, active && styles.activeCell, selected && styles.selectedCell]}>
                    {!!clueNumbers[key] && <Text style={styles.num}>{clueNumbers[key]}</Text>}
                    <Text style={styles.cellT}>{fills[key] || ""}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Animated.View>

        <ScrollView style={styles.clues} contentContainerStyle={styles.clueWrap}>
          {entries.map((entry, i) => (
            <Pressable key={entry.id} onPress={() => selectEntry(i)} style={[styles.clue, i === selectedEntry && styles.clueActive]}>
              <Text style={styles.clueId}>{entry.id}</Text>
              <Text style={styles.clueT}>{entry.clue}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ marginTop: "auto", gap: 12, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <GhostButton label={`Hint -${MISSING_HINT}`} onPress={hint} style={{ flex: 1 }} />
            <GradientButton label="Submit" colors={G.grad as any} onPress={submit} disabled={!complete} style={{ flex: 1 }} />
          </View>
          <Keyboard onKey={onKey} showEnter={false} />
        </View>
        {result && <ResultPanel title={result.title} detail={result.detail} score={result.score} won={result.won} forFun={forFun} breakdown={result.breakdown} nextLabel={nextGameName ? `Continue to ${nextGameName}` : "Continue"} onContinue={() => finish(result.payload, "next")} onHome={() => finish(result.payload, "home")} />}
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },
  toast: { position: "absolute", top: 96, alignSelf: "center", zIndex: 10, backgroundColor: C.surfaceHi, borderWidth: 1, borderColor: C.hairline, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
  toastWin: { backgroundColor: C.correct, borderColor: C.correct },
  toastT: { color: "#fff", fontWeight: "800" },
  activeClue: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surfaceHi, borderWidth: 1.5, borderColor: G.hue, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 14, marginTop: 14 },
  activeId: { color: G.hue, fontSize: 14, fontWeight: "900", width: 30 },
  activeText: { color: C.text, fontSize: 15, fontWeight: "800", flex: 1 },
  board: { alignSelf: "center", marginTop: 14, borderWidth: 2, borderColor: C.hairline, backgroundColor: C.hairline },
  row: { flexDirection: "row" },
  cell: { width: 52, height: 52, backgroundColor: C.surfaceHi, borderWidth: 1, borderColor: C.hairline, alignItems: "center", justifyContent: "center" },
  block: { backgroundColor: C.bg0 },
  activeCell: { backgroundColor: "#3B2F20" },
  selectedCell: { borderColor: G.hue, borderWidth: 2 },
  num: { position: "absolute", top: 3, left: 4, color: C.textFaint, fontSize: 9, fontWeight: "800" },
  cellT: { color: "#fff", fontSize: 26, fontWeight: "800", fontFamily: tileFont, textAlign: "center", width: "100%", includeFontPadding: false },
  clues: { maxHeight: 130, marginTop: 14 },
  clueWrap: { gap: 8, paddingBottom: 4 },
  clue: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.hairline, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 12 },
  clueActive: { borderColor: G.hue, backgroundColor: C.surfaceHi },
  clueId: { color: G.hue, fontSize: 13, fontWeight: "900", width: 28 },
  clueT: { color: C.text, fontSize: 14, fontWeight: "700", flex: 1 },
});
