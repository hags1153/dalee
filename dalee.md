# Dalee — the Daily Word Circuit

Dalee is a free-to-play daily word game for iOS. Every day it serves one **circuit of five
word games** — everyone in the world gets the same puzzles that day — playable in about 25
minutes, with a big satisfying scoring system and a come-back-tomorrow streak.

> **Brand rule:** Dalee is a **standalone** product. It is kept 100% separate from RaceScan —
> never host Dalee assets/URLs on racescan.racing and never cross-brand the two.

---

## The circuit (5 games)

| # | Game | Goal | Hue |
|---|------|------|-----|
| 1 | **Wordle** | Guess the 5-letter word in 6 tries | green `#22C55E` |
| 2 | **Scramble** | Unscramble the jumbled letters | violet `#8B5CF6` |
| 3 | **Ladder** | Change one letter at a time to reach the target | sky `#0EA5E9` |
| 4 | **Missing** | Fill in the blanks from a clue | amber `#F59E0B` |
| 5 | **Blitz** | Make as many words as you can in 60 seconds | rose `#F43F5E` |

All five are deterministic per day: the puzzle for a given date is derived from a seed
(`dayIndex * 100 + gameSalt`), so the whole world plays the same set and results are comparable.

---

## Scoring system (`src/scoring.ts`)

Big, satisfying numbers. Each game tops out around ~1,200; a clean full circuit clears well
over 5,000 including the completion bonus.

- **Wordle** — by guess count: 1→1200, 2→1000, 3→820, 4→640, 5→480, 6→320. Loss = 0.
- **Scramble** — `max(200, 1000 − wrong·120 − hints·180)`.
- **Ladder** — `max(350, 1150 − steps·80)` (shorter chain = more).
- **Missing** — `max(200, 1000 − wrong·130 − hints·220)`.
- **Blitz** — per word by length: 7+→250, 6→150, 5→90, 4→45, 3→20 (adds up fast in 60s).
- **Completion bonus** — **+750** for finishing all five in a day.

`dayTotal(d) = sum(game scores) + (all five done ? 750 : 0)`. The Hub shows this as the big
"TODAY'S SCORE". Lifetime `totalScore` and `bestDay` are tracked in stats.

---

## Architecture

Expo SDK 57 / React Native 0.86 / TypeScript. EAS cloud-builds the iOS binary (no Mac needed).
No backend — everything is local (free to play, **no data collected**).

```
App.tsx                 root router (hub | game | signin), loads day + stats
src/
  theme.ts              design tokens: palette, per-game hues/gradients, radius, font, shadow
  daily.ts              dayIndex (EPOCH 2026-01-01), mulberry32 seededRng, pick/shuffle, seedFor
  scoring.ts            all score math + fmt() thousands separator + COMPLETION_BONUS
  storage.ts            AsyncStorage: DayState, Stats, circuit helpers, dayTotal, commitCircuit
  wordbank.ts           dict5/dict4/blitz Sets + WORDLE_ANSWERS/SCRAMBLE/MISSING/LADDERS/BLITZ_BASES
  data/*.json           generated dictionaries from /usr/share/dict/american-english
  ui.tsx                ScreenBG, GradientButton, GhostButton, Card, Header, ProgressDots,
                        Keyboard (showEnter toggle), haptic
  Hub.tsx               home: score showcase, stat strip, 5 game cards, CTA
  SignIn.tsx            dormant Apple/Google SSO buttons (free-to-play, no backend yet)
  games/
    types.ts            GameProps { seed, onDone, onClose, existing? }
    Wordle.tsx  Scramble.tsx  Ladder.tsx  Missing.tsx  Blitz.tsx
```

**Conventions**
- Animations use RN built-in `Animated` only. **Do NOT add react-native-reanimated** — v4 needs
  New Arch + worklets + babel plugin that aren't configured, and it fails the native build.
  Only `expo-linear-gradient` + `expo-haptics` beyond the RN core.
- Wordle & Ladder type into tiles; **in-progress tiles are filled + high-contrast** so narrow
  glyphs (e.g. "I") are clearly visible. They use a dedicated **SUBMIT** button above the keyboard
  (`Keyboard showEnter={false}`), not the ↵ key. Missing also uses its own Submit button.
- See `AGENTS.md`: read the versioned Expo v57 docs before writing native/config code.

---

## Apple / EAS identifiers

- App name **Dalee**, slug **dalee**, bundle **com.racescan.dalee** (Android package same).
- Apple Team **86P3UP8S57** (Ryan Hagerty, Individual). EAS project **@hags1153/dalee**
  (projectId `8a4896a9-9612-4fe7-a544-8bb12ac5ed87`, owner hags1153).
- App Store Connect **ascAppId 6793329838**, SKU `dalee`.
- Reuses RaceScan's shared distribution cert + **ASC API key 6D4ACN7D5U**
  (`~/Downloads/AuthKey_6D4ACN7D5U.p8`, issuer `c0d30d65-1d8e-4838-ab7d-427fff401e53`).
  ASC keys are account-wide; dist certs are shared across apps — never mint new per app.
- `ITSAppUsesNonExemptEncryption=false` (export compliance pre-answered).

## Build & submit (non-interactive from this box)

```bash
cd ~/games/daily-word
eas build  --platform ios --profile production --non-interactive
eas submit --platform ios --latest --profile production --non-interactive
```

Both run headless — credentials are cached. `eas.json` wires the ASC key + ascAppId.
Store metadata lives in `store.config.json` (push with `eas metadata:push`).

## TestFlight

- Internal group **DaleeDev** (`isInternalGroup=true`, all-builds access) — Ryan is a tester
  (hags1234@hotmail.com). Internal testers get every build automatically once it finishes
  processing; no per-build assignment needed.
- External group **DaleeDevExt** (Caryn, Joel) — not yet invited; external testing needs beta
  app review first.
- Set a build's "What to Test" note via the `betaBuildLocalizations` ASC API.

## Hosting (standalone — NOT on RaceScan)

GitHub repo **github.com/hags1153/dalee**, GitHub Pages from `/docs`:
privacy `…github.io/dalee/privacy.html`, support `/support.html`, marketing `/`.
Store screenshots live in `docs/screenshots/` and `screenshots/`.

---

## Version history

- **1.0.0 (build 2)** — original single Wordle-style game. Submitted to TestFlight 2026-07-21;
  went to App Store review.
- **1.0.1 (build 4)** — the Daily Circuit revamp (5 games, premium UI, hub, streaks, dormant
  Sign-in). Uploaded to TestFlight 2026-07-22. Store submission deferred (can't create a new
  store version while 1.0 is in review).
- **1.0.2** — polish pass: big scoring system, redesigned Hub score showcase, SUBMIT buttons on
  Wordle/Ladder, high-contrast letter tiles (fixes hard-to-see "I"), win flourishes, tidy-up
  across all pages.

## Roadmap / fast-follow

- Real SSO (Apple Sign-In + Google) + cloud sync + leaderboards → flips App Privacy to
  "data collected"; needs credentials + a backend.
- Daily reminder push notifications (needs Push capability + expo-notifications).
- Submit the circuit to the App Store once 1.0 clears review and testing is done (see task #20).
