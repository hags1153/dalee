import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenBG, GradientButton, haptic } from "./ui";
import { palette as C, games, gradients, radius, font, shadow, CIRCUIT, GameKey } from "./theme";
import { DayState, Stats, circuitProgress, circuitScore, circuitComplete } from "./storage";
import { prettyDate } from "./daily";

export default function Hub({ day, dayState, stats, onPlay, onSignIn }: {
  day: number; dayState: DayState; stats: Stats;
  onPlay: (k: GameKey) => void; onSignIn: () => void;
}) {
  const progress = circuitProgress(dayState);
  const done = circuitComplete(dayState);
  const score = circuitScore(dayState);
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

        {/* stat strip */}
        <View style={styles.stats}>
          <Stat label="STREAK" value={`${stats.streak}🔥`} />
          <View style={styles.divider} />
          <Stat label="TODAY" value={done ? `${score}` : `${progress}/5`} />
          <View style={styles.divider} />
          <Stat label="BEST" value={`${stats.maxStreak}`} />
        </View>

        {/* circuit header */}
        <View style={styles.circHead}>
          <Text style={styles.h2}>Today's Circuit</Text>
          <Text style={styles.est}>{done ? "Complete 🎉" : "~25 min · 5 games"}</Text>
        </View>

        {/* game cards */}
        <View style={{ gap: 12 }}>
          {CIRCUIT.map((k, i) => {
            const g = games[k]; const r = dayState.results[k];
            return (
              <Pressable key={k} onPress={() => { haptic.tap("medium"); onPlay(k); }}>
                <View style={[styles.card, shadow.card, r?.done && { borderColor: C.correct + "55" }]}>
                  <LinearGradient colors={g.grad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
                    <Text style={styles.badgeT}>{g.icon}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{i + 1}. {g.name}</Text>
                    <Text style={styles.cardTag}>{g.tag}</Text>
                  </View>
                  {r?.done
                    ? <View style={styles.scorePill}><Text style={styles.scorePillT}>{r.won ? `+${r.score}` : "—"}</Text></View>
                    : <Text style={styles.chev}>›</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <View style={{ marginTop: 20 }}>
          {done
            ? <View style={styles.doneCard}><Text style={styles.doneT}>Circuit complete!</Text><Text style={styles.doneSub}>You scored {score} today · streak {stats.streak}🔥</Text></View>
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
  stats: { flexDirection: "row", backgroundColor: C.surface, borderRadius: radius.lg, paddingVertical: 16, marginTop: 20, borderWidth: 1, borderColor: C.hairline },
  divider: { width: 1, backgroundColor: C.hairline },
  statV: { color: C.text, fontSize: 22, fontWeight: "800" },
  statL: { color: C.textFaint, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 3 },
  circHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 26, marginBottom: 14 },
  h2: { color: C.text, ...font.h1 },
  est: { color: C.textFaint, ...font.label },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: radius.lg, padding: 14, gap: 14, borderWidth: 1, borderColor: C.hairline },
  badge: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  badgeT: { fontSize: 26 },
  cardTitle: { color: C.text, ...font.h2 },
  cardTag: { color: C.textFaint, ...font.label, marginTop: 2 },
  scorePill: { backgroundColor: C.correct + "22", paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  scorePillT: { color: C.correct, fontWeight: "800" },
  chev: { color: C.textFaint, fontSize: 28, fontWeight: "300", paddingRight: 4 },
  doneCard: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 20, alignItems: "center", borderWidth: 1, borderColor: C.correct + "55" },
  doneT: { color: C.correct, fontSize: 20, fontWeight: "800" },
  doneSub: { color: C.textDim, marginTop: 6, fontWeight: "600" },
});
