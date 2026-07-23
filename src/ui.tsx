import React, { useRef } from "react";
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
      <View style={styles.close}>{right}</View>
    </View>
  );
}

// Live stopwatch badge for the header — makes it clear that speed counts.
export function TimerBadge({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const label = m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
  return (
    <View style={styles.timer}><Text style={styles.timerT}>⏱ {label}</Text></View>
  );
}

// A short one-line explainer shown at the top of each game.
export function GameIntro({ text }: { text: string }) {
  return <Text style={styles.intro}>{text}</Text>;
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

// On-screen keyboard shared by Wordle / Ladder / Missing.
// showEnter=false hides the ↵ key so the game can use a dedicated SUBMIT button.
export function Keyboard({ onKey, statuses, showEnter = true }: { onKey: (k: string) => void; statuses?: Record<string, "correct" | "present" | "absent">; showEnter?: boolean }) {
  const col = (s?: string) => s === "correct" ? C.correct : s === "present" ? C.present : s === "absent" ? C.absent : C.surfaceHi;
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
  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "android" ? 12 : 6, paddingBottom: 10 },
  close: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  closeText: { color: C.textDim, fontSize: 20, fontWeight: "700" },
  hTitle: { color: C.text, ...font.h2 },
  hSub: { color: C.textFaint, ...font.label, marginTop: 2 },
  key: { minWidth: 30, flex: 1, maxWidth: 42, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  keyWide: { flex: 1.5, maxWidth: 58 },
  keyText: { color: C.text, fontSize: 16, fontWeight: "700" },
  timer: { backgroundColor: C.surfaceHi, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  timerT: { color: C.textDim, fontSize: 13, fontWeight: "800" },
  intro: { color: C.textDim, fontSize: 13.5, lineHeight: 19, textAlign: "center", marginTop: 10, paddingHorizontal: 10 },
});
