import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenBG, GradientButton, haptic } from "./ui";
import { palette as C, games, gradients, radius, font, shadow, CIRCUIT, GameKey } from "./theme";
import { DayState, Stats, circuitProgress, circuitComplete, dayTotal } from "./storage";
import { fmt } from "./scoring";
import { prettyDate } from "./daily";

export default function Hub({ day, dayState, stats, onPlay, onSignIn }: {
  day: number; dayState: DayState; stats: Stats;
  onPlay: (k: GameKey) => void; onSignIn: () => void;
}) {
  const progress = circuitProgress(dayState);
  const done = circuitComplete(dayState);
  const total = dayTotal(dayState);
  const next = CIRCUIT.find((k) => !dayState.results[k]?.done);

  return (
    <ScreenBG>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        {/* hero */}
        <View style={styles.top}>
          <View>
            <Text style={styles.brand}>DALEE</Text>
            <Text style={styles.date}>{prettyDate()}</Text>
          </View>
          <Pressable onPress={() => { haptic.tap(); onSignIn(); }} style={styles.avatar}><Text style={styles.avatarT}>👤</Text></Pressable>
        </View>

        {/* score showcase */}
        <LinearGradient colors={gradients.score as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.scoreCard, shadow.glow(C.accent)]}>
          <Text style={styles.scoreLabel}>{done ? "TODAY — COMPLETE 🎉" : "TODAY'S SCORE"}</Text>
          <Text style={styles.scoreBig}>{fmt(total)}</Text>
          <View style={styles.pips}>
            {CIRCUIT.map((k) => (
              <View key={k} style={[styles.pip, dayState.results[k]?.done && styles.pipOn]} />
            ))}
          </View>
          <Text style={styles.scoreSub}>{done ? `+${fmt(750)} circuit bonus included` : `${progress} of 5 games done`}</Text>
        </LinearGradient>

        {/* stat strip */}
        <View style={styles.stats}>
          <Stat label="STREAK" value={`${stats.streak}🔥`} />
          <View style={styles.divider} />
          <Stat label="BEST DAY" value={fmt(stats.bestDay)} />
          <View style={styles.divider} />
          <Stat label="TOTAL" value={fmt(stats.totalScore)} />
        </View>

        {/* circuit header */}
        <View style={styles.circHead}>
          <Text style={styles.h2}>Today's Circuit</Text>
          <Text style={styles.est}>{done ? "Come back tomorrow" : "~25 min · 5 games"}</Text>
        </View>

        {/* game cards */}
        <View style={{ gap: 12 }}>
          {CIRCUIT.map((k, i) => {
            const g = games[k]; const r = dayState.results[k];
            return (
              <Pressable key={k} onPress={() => { haptic.tap("medium"); onPlay(k); }}>
                <View style={[styles.card, shadow.card, r?.done && { borderColor: g.hue + "66" }]}>
                  <LinearGradient colors={g.grad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
                    <Text style={styles.badgeT}>{g.icon}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{i + 1}. {g.name}</Text>
                    <Text style={styles.cardTag}>{g.tag}</Text>
                  </View>
                  {r?.done
                    ? <View style={[styles.scorePill, { backgroundColor: g.hue + "22" }]}><Text style={[styles.scorePillT, { color: g.hue }]}>{r.won ? `+${fmt(r.score)}` : "—"}</Text></View>
                    : <Text style={styles.chev}>›</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <View style={{ marginTop: 20 }}>
          {done
            ? <View style={styles.doneCard}>
                <Text style={styles.doneT}>Circuit complete!</Text>
                <Text style={styles.doneSub}>You scored {fmt(total)} today · {stats.streak}🔥 day streak</Text>
                <Text style={styles.doneFun}>Already completed today — tap any game to play for fun. It won't change your score.</Text>
                <GradientButton label="Play for fun 🎈" colors={gradients.brand as any} onPress={() => onPlay(CIRCUIT[0])} style={{ marginTop: 14, alignSelf: "stretch" }} />
              </View>
            : <GradientButton label={progress === 0 ? "Start today's circuit" : `Continue → ${games[next!].name}`} colors={gradients.brand as any} onPress={() => next && onPlay(next)} />}
        </View>
      </ScrollView>
    </ScreenBG>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={{ alignItems: "center", flex: 1 }}><Text style={styles.statV}>{value}</Text><Text style={styles.statL}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 60, paddingBottom: 40 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { color: C.text, fontSize: 38, fontWeight: "900", letterSpacing: 2 },
  date: { color: C.textFaint, ...font.label, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.hairline },
  avatarT: { fontSize: 20 },

  scoreCard: { borderRadius: radius.xl, paddingVertical: 22, paddingHorizontal: 20, marginTop: 20, alignItems: "center" },
  scoreLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  scoreBig: { color: "#fff", fontSize: 56, fontWeight: "900", letterSpacing: 1, marginTop: 2 },
  pips: { flexDirection: "row", gap: 8, marginTop: 8 },
  pip: { width: 26, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.28)" },
  pipOn: { backgroundColor: "#fff" },
  scoreSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700", marginTop: 12 },

  stats: { flexDirection: "row", backgroundColor: C.surface, borderRadius: radius.lg, paddingVertical: 16, marginTop: 16, borderWidth: 1, borderColor: C.hairline },
  divider: { width: 1, backgroundColor: C.hairline },
  statV: { color: C.text, fontSize: 20, fontWeight: "800" },
  statL: { color: C.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 3 },

  circHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 26, marginBottom: 14 },
  h2: { color: C.text, ...font.h1 },
  est: { color: C.textFaint, ...font.label },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: radius.lg, padding: 14, gap: 14, borderWidth: 1, borderColor: C.hairline },
  badge: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  badgeT: { fontSize: 26 },
  cardTitle: { color: C.text, ...font.h2 },
  cardTag: { color: C.textFaint, ...font.label, marginTop: 2 },
  scorePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  scorePillT: { fontWeight: "800" },
  chev: { color: C.textFaint, fontSize: 28, fontWeight: "300", paddingRight: 4 },
  doneCard: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 20, alignItems: "center", borderWidth: 1, borderColor: C.correct + "55" },
  doneT: { color: C.correct, fontSize: 20, fontWeight: "800" },
  doneSub: { color: C.textDim, marginTop: 6, fontWeight: "600" },
  doneFun: { color: C.textFaint, marginTop: 12, fontWeight: "600", fontSize: 13, textAlign: "center", lineHeight: 18 },
});
