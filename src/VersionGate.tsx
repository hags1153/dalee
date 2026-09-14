import React, { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import * as Updates from "expo-updates";
import { GradientButton, GhostButton, ScreenBG } from "./ui";
import { gradients, palette as C, radius } from "./theme";
import { APP_STORE_URL, APP_VERSION, CONTENT_VERSION, VERSION_URL } from "./version";

type VersionManifest = {
  latestVersion?: string;
  minimumVersion?: string;
  contentVersion?: string;
  appStoreUrl?: string;
  message?: string;
};

type GateState = { required: false } | { required: true; manifest: VersionManifest };

function compareVersions(a: string, b: string): number {
  const left = a.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function applyOtaUpdateIfAvailable() {
  if (!Updates.isEnabled) return;
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  }
}

export function useVersionGate() {
  const [gate, setGate] = useState<GateState>({ required: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await applyOtaUpdateIfAvailable();
      } catch (error) {
        console.log("[Dalee] OTA update check failed", error);
      }

      try {
        const response = await fetch(`${VERSION_URL}?t=${Date.now()}`);
        const manifest = (await response.json()) as VersionManifest;
        const required = manifest.minimumVersion || manifest.latestVersion;
        if (alive && required && compareVersions(APP_VERSION, required) < 0) {
          setGate({ required: true, manifest });
        } else if (
          alive &&
          Updates.isEnabled &&
          manifest.contentVersion &&
          manifest.contentVersion !== CONTENT_VERSION
        ) {
          applyOtaUpdateIfAvailable().catch((error) => console.log("[Dalee] OTA refresh failed", error));
        }
      } catch (error) {
        console.log("[Dalee] version check failed", error);
      }
    })();
    return () => { alive = false; };
  }, []);

  return gate;
}

export function UpdateRequired({ manifest }: { manifest: VersionManifest }) {
  const storeUrl = manifest.appStoreUrl || APP_STORE_URL;
  const openStore = () => Linking.openURL(storeUrl).catch(() => {});

  return (
    <ScreenBG>
      <View style={styles.wrap}>
        <View style={styles.logo}><Text style={styles.logoT}>D</Text></View>
        <Text style={styles.title}>Update Dalee</Text>
        <Text style={styles.body}>
          {manifest.message || "A newer Dalee version is available. Update from the App Store to keep today's circuit and leaderboards in sync."}
        </Text>
        <GradientButton label="Open App Store" colors={gradients.brand as any} onPress={openStore} />
        <GhostButton label={`Installed ${APP_VERSION}`} />
      </View>
    </ScreenBG>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 18 },
  logo: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 6 },
  logoT: { color: "#fff", fontSize: 42, fontWeight: "900" },
  title: { color: C.text, fontSize: 30, fontWeight: "900", textAlign: "center" },
  body: { color: C.textDim, fontSize: 16, lineHeight: 23, textAlign: "center", marginBottom: 8 },
});
