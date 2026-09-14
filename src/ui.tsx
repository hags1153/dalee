import React, { useEffect, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Animated, ViewStyle, TextStyle, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { palette as C, radius, font, shadow, gradients } from "./theme";

const tap = (style: "light" | "medium" | "heavy" = "light") =>
  Platform.OS !== "web" && Haptics.impactAsync(
    style === "light" ? Haptics.ImpactFeedbackStyle.Light :
    style === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy
  ).catch(() => {});
export const haptic = { tap, success: () => Platform.OS !== "web" && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}), error: () => Platform.OS !== "web" && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}) };

export function ScreenBG({ children, colors }: { children: React.ReactNode; colors?: string[] }) {
  return (
    <LinearGradient colors={(colors as any) || (gradients.app as any)} style={styles.bg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      {children}
    </LinearGradient>
  );
}

export function GradientButton({ label, onPress, colors, style, disabled }: { label: string; onPress?: () => void; colors?: string[]; style?: ViewStyle; disabled?: boolean }) {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => { Animated.spring(s, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start(); tap("light"); }}
      onPressOut={() => Animated.spring(s, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
      onPress={disabled ? undefined : onPress} style={style}>
      <Animated.View style={{ transform: [{ scale: s }], opacity: disabled ? 0.45 : 1 }}>
        <LinearGradient colors={(colors as any) || (gradients.brand as any)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.btn, shadow.glow((colors?.[0] as string) || C.accent)]}>
          <Text style={styles.btnText}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, style }: { label: string; onPress?: () => void; style?: ViewStyle }) {
  return (
    <Pressable onPress={() => { tap("light"); onPress?.(); }} style={[styles.ghost, style]}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

export function Header({ title, subtitle, onClose, right }: { title: string; subtitle?: string; onClose?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      {onClose ? <Pressable hitSlop={12} onPress={() => { tap("light"); onClose(); }} style={styles.close}><Text style={styles.closeText}>✕</Text></Pressable> : <View style={styles.close} />}
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={styles.hTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.hSub}>{subtitle}</Text>}
      </View>
      <View style={[styles.rightSlot, right ? styles.rightSlotWide : null]}>{right}</View>
    </View>
  );
}

// Full stopwatch (M:SS), always shown so players can watch the clock.
export function TimerBadge({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return <View style={styles.timer}><Text style={styles.timerT}>⏱ {m}:{String(s).padStart(2, "0")}</Text></View>;
}

// Live "points on the line" pill — visibly drops when a hint or wrong guess costs points.
export function PointsPill({ points }: { points: number }) {
  const drop = useRef(new Animated.Value(0)).current;
  const previous = useRef(points);
  useEffect(() => {
    if (points < previous.current) {
      drop.setValue(1);
      Animated.timing(drop, { toValue: 0, duration: 420, useNativeDriver: true }).start();
    }
    previous.current = points;
  }, [drop, points]);
  return (
    <View style={styles.points}>
      <Animated.View style={[styles.pointsDrop, { opacity: drop }]} />
      <Text style={styles.pointsT}>★ {points}</Text>
    </View>
  );
}

export function LiveScoreToggle({ points, visible = true, onToggle }: { points: number; visible?: boolean; onToggle?: () => void }) {
  if (!visible) {
    return (
      <Pressable onPress={() => { tap("light"); onToggle?.(); }} style={styles.scoreToggle}>
        <Text style={styles.scoreToggleT}>Show Score</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={() => { tap("light"); onToggle?.(); }} style={styles.scoreWrap}>
      <PointsPill points={points} />
      <Text style={styles.scoreHide}>Hide</Text>
    </Pressable>
  );
}

// Shown when replaying a game that's already done today.
export function FunBanner() {
  return <View style={styles.funBanner}><Text style={styles.funT}>✓ Already completed today — playing for fun. This won't change your score.</Text></View>;
}

// A short one-line explainer shown at the top of each game.
export function GameIntro({ text }: { text: string }) {
  return <Text style={styles.intro}>{text}</Text>;
}

export type ScoreLine = { label: string; value: number | string; tone?: "good" | "bad" | "neutral" };

export function ResultPanel({ title, detail, score, won, forFun, nextLabel, breakdown, onContinue, onHome }: {
  title: string;
  detail: string;
  score: number;
  won: boolean;
  forFun?: boolean;
  nextLabel?: string;
  breakdown?: ScoreLine[];
  onContinue: () => void;
  onHome?: () => void;
}) {
  return (
    <View style={styles.resultOverlay}>
      <View style={styles.resultCard}>
        <Text style={[styles.resultTitle, { color: won ? C.correct : C.present }]}>{title}</Text>
        <Text style={styles.resultDetail}>{detail}</Text>
        <Text style={styles.resultScore}>{forFun ? "For fun" : `+${score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</Text>
        {!!breakdown?.length && (
          <View style={styles.breakdown}>
            {breakdown.map((line) => (
              <View key={line.label} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{line.label}</Text>
                <Text style={[styles.breakdownValue, line.tone === "good" && styles.breakdownGood, line.tone === "bad" && styles.breakdownBad]}>{typeof line.value === "number" && line.value > 0 ? `+${line.value}` : line.value}</Text>
              </View>
            ))}
          </View>
        )}
        <GradientButton label={nextLabel || "Continue"} onPress={onContinue} />
        <GhostButton label="Go to Home" onPress={onHome} style={{ alignSelf: "stretch" }} />
      </View>
    </View>
  );
}

// Counts up once per second while `active`; resets nothing, just accumulates.
export function useStopwatch(active: boolean) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

export function ProgressDots({ total, done, color }: { total: number; done: number; color?: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i < done ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i < done ? (color || C.accent) : C.hairline }} />
      ))}
    </View>
  );
}

// On-screen keyboard shared by Wordle / Ladder / Mini Crossword.
// showEnter=false hides the ↵ key so the game can use a dedicated SUBMIT button.
export function Keyboard({ onKey, statuses, showEnter = true }: { onKey: (k: string) => void; statuses?: Record<string, "correct" | "present" | "absent">; showEnter?: boolean }) {
  const col = (s?: string) => s === "correct" ? C.correct : s === "present" ? C.present : s === "absent" ? "rgba(244,63,94,0.24)" : C.surfaceHi;
  const rows = ["QWERTYUIOP", "ASDFGHJKL", `${showEnter ? "↵" : ""}ZXCVBNM⌫`];
  return (
    <View style={{ gap: 7, paddingHorizontal: 4 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
          {row.split("").map((k) => {
            const wide = k === "↵" || k === "⌫";
            return (
              <Pressable key={k} onPress={() => { tap("light"); onKey(k); }}
                style={[styles.key, wide && styles.keyWide, { backgroundColor: statuses?.[k] ? col(statuses[k]) : C.surfaceHi }]}>
                <Text style={styles.keyText}>{k}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  btn: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: radius.pill, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
  ghost: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.pill, alignItems: "center", borderWidth: 1.5, borderColor: C.hairline },
  ghostText: { color: C.textDim, fontSize: 16, fontWeight: "700" },
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: C.hairline },
  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "android" ? 12 : 6, paddingBottom: 10, gap: 8 },
  close: { width: 44, height: 40, alignItems: "center", justifyContent: "center" },
  closeText: { color: C.textDim, fontSize: 20, fontWeight: "700" },
  hTitle: { color: C.text, ...font.h2 },
  hSub: { color: C.textFaint, ...font.label, marginTop: 2 },
  key: { minWidth: 30, flex: 1, maxWidth: 42, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  keyWide: { flex: 1.5, maxWidth: 58 },
  keyText: { color: C.text, fontSize: 16, fontWeight: "700", textAlign: "center", width: "100%" },
  rightSlot: { minWidth: 44, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 },
  rightSlotWide: { minWidth: 120 },
  timer: { backgroundColor: C.surfaceHi, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  timerT: { color: C.text, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  points: { backgroundColor: C.accent + "22", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, overflow: "hidden" },
  pointsDrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(244,63,94,0.36)" },
  pointsT: { color: C.accentSoft, fontSize: 14, fontWeight: "800", zIndex: 1 },
  scoreWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  scoreHide: { color: C.textFaint, fontSize: 11, fontWeight: "800" },
  scoreToggle: { backgroundColor: C.surfaceHi, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: C.hairline },
  scoreToggleT: { color: C.textDim, fontSize: 11, fontWeight: "800" },
  intro: { color: C.textDim, fontSize: 13.5, lineHeight: 19, textAlign: "center", marginTop: 10, paddingHorizontal: 10 },
  funBanner: { backgroundColor: C.present + "1F", borderColor: C.present + "66", borderWidth: 1, borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 14, marginTop: 10 },
  funT: { color: C.present, fontSize: 12.5, fontWeight: "700", textAlign: "center", lineHeight: 17 },
  resultOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 20, backgroundColor: "rgba(11,12,16,0.78)", alignItems: "center", justifyContent: "center", padding: 22 },
  resultCard: { width: "100%", maxWidth: 360, backgroundColor: C.surface, borderColor: C.hairline, borderWidth: 1, borderRadius: radius.lg, padding: 22, gap: 12, alignItems: "center" },
  resultTitle: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  resultDetail: { color: C.textDim, fontSize: 15, lineHeight: 21, textAlign: "center", fontWeight: "600" },
  resultScore: { color: C.text, fontSize: 42, fontWeight: "900", textAlign: "center" },
  breakdown: { alignSelf: "stretch", backgroundColor: C.bg1, borderRadius: radius.md, borderWidth: 1, borderColor: C.hairline, paddingVertical: 8 },
  breakdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 5 },
  breakdownLabel: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  breakdownValue: { color: C.text, fontSize: 13, fontWeight: "900" },
  breakdownGood: { color: C.correct },
  breakdownBad: { color: C.present },
});
