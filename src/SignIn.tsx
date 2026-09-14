import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { ScreenBG, Header, GhostButton, GradientButton, haptic } from "./ui";
import { palette as C, radius, gradients } from "./theme";
import { LinearGradient } from "expo-linear-gradient";
import { LeaderboardPeriod } from "./gameCenter";

export default function SignIn({ onClose, onLeaderboard, onAchievements, onDashboard }: {
  onClose: () => void;
  onLeaderboard: (period: LeaderboardPeriod) => void;
  onAchievements: () => void;
  onDashboard: () => void;
}) {
  const syncSoon = () => { haptic.tap(); Alert.alert("Saved on this device", "Game Center leaderboards are available now. Cross-device streak sync is planned for a later update."); };
  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Your Dalee" onClose={onClose} />
        <View style={styles.hero}>
          <LinearGradient colors={gradients.brand as any} style={styles.logo}><Text style={styles.logoT}>D</Text></LinearGradient>
          <Text style={styles.title}>Dalee Leaderboards</Text>
          <Text style={styles.sub}>Submit your completed circuit score to Game Center and compare daily, weekly, and yearly rankings.</Text>
        </View>
        <View style={{ gap: 12 }}>
          <GradientButton label="Daily Leaderboard" colors={gradients.brand as any} onPress={() => onLeaderboard("daily")} />
          <View style={styles.leaderboardRow}>
            <GhostButton label="Weekly" onPress={() => onLeaderboard("weekly")} style={styles.leaderboardBtn} />
            <GhostButton label="Yearly" onPress={() => onLeaderboard("yearly")} style={styles.leaderboardBtn} />
          </View>
          <View style={styles.leaderboardRow}>
            <GhostButton label="Achievements" onPress={onAchievements} style={styles.leaderboardBtn} />
            <GhostButton label="Dashboard" onPress={onDashboard} style={styles.leaderboardBtn} />
          </View>
          <Pressable onPress={syncSoon} style={[styles.sso, { backgroundColor: "#000", borderColor: "#000" }]}>
            <Text style={[styles.ssoT, { color: "#fff" }]}>Cloud sync later</Text>
          </Pressable>
          <GhostButton label="Play as guest" onPress={onClose} />
        </View>
        <Text style={styles.foot}>Dalee is free to play. We don't collect any personal data.</Text>
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 22, paddingTop: 50, paddingBottom: 30 },
  hero: { alignItems: "center", marginTop: 20, marginBottom: "auto", paddingTop: 30 },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  logoT: { color: "#fff", fontSize: 48, fontWeight: "900" },
  title: { color: C.text, fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 24 },
  sub: { color: C.textDim, fontSize: 15, textAlign: "center", marginTop: 12, lineHeight: 22, paddingHorizontal: 8 },
  leaderboardRow: { flexDirection: "row", gap: 10 },
  leaderboardBtn: { flex: 1 },
  sso: { height: 54, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  ssoT: { fontSize: 17, fontWeight: "700" },
  foot: { color: C.textFaint, fontSize: 12, textAlign: "center", marginTop: 18 },
});
