import React from "react";
import { View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { ScreenBG, Header, GhostButton, haptic } from "./ui";
import { palette as C, radius, gradients } from "./theme";
import { LinearGradient } from "expo-linear-gradient";

// Sign-in is intentionally dormant in 1.0.1 — free to play, no data collected.
// Buttons are wired and styled; cloud accounts (Apple/Google SSO) turn on in a follow-up.
export default function SignIn({ onClose }: { onClose: () => void }) {
  const soon = () => { haptic.tap(); Alert.alert("Coming soon", "Cloud sync + leaderboards are on the way. For now your streak is saved right here on your device — 100% free, no account needed."); };
  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <Header title="Your Dalee" onClose={onClose} />
        <View style={styles.hero}>
          <LinearGradient colors={gradients.brand as any} style={styles.logo}><Text style={styles.logoT}>D</Text></LinearGradient>
          <Text style={styles.title}>Save your streak everywhere</Text>
          <Text style={styles.sub}>Sync your circuit, stats, and streak across devices — and climb the daily leaderboard. Free, always.</Text>
        </View>
        <View style={{ gap: 12 }}>
          <Pressable onPress={soon} style={[styles.sso, { backgroundColor: "#000", borderColor: "#000" }]}>
            <Text style={[styles.ssoT, { color: "#fff" }]}> Sign in with Apple</Text>
          </Pressable>
          <Pressable onPress={soon} style={[styles.sso, { backgroundColor: "#fff", borderColor: "#fff" }]}>
            <Text style={[styles.ssoT, { color: "#1a1a1a" }]}>Continue with Google</Text>
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
  sso: { height: 54, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  ssoT: { fontSize: 17, fontWeight: "700" },
  foot: { color: C.textFaint, fontSize: 12, textAlign: "center", marginTop: 18 },
});
