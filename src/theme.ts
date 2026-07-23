// Dalee design system — a premium, dark, vibrant look for the daily word circuit.
import { Platform } from "react-native";

// Monospaced face for letter tiles — every glyph has real width (the capital "I"
// gets serifs), so single letters read clearly instead of vanishing to a thin stroke.
export const tileFont = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as string;

export const palette = {
  // base
  bg0: "#0B0C10",       // deepest background
  bg1: "#111219",       // app background
  surface: "#1A1C26",   // cards
  surfaceHi: "#242737",  // raised / pressed
  hairline: "#2C2F3E",
  // text
  text: "#F4F6FB",
  textDim: "#A7ADC2",
  textFaint: "#6B7086",
  // semantic (word-game tile states)
  correct: "#22C55E",
  present: "#F5B942",
  absent: "#3A3E4E",
  // brand accent
  accent: "#7C5CFF",
  accentSoft: "#9B86FF",
} as const;

// Per-game identity — each game in the circuit gets its own hue + gradient.
export const games = {
  wordle:   { key: "wordle",   name: "Wordle",   tag: "Guess the word",        desc: "Guess the hidden 5-letter word in six tries. Tile colors tell you which letters are right.", hue: "#22C55E", grad: ["#16A34A", "#22C55E"], icon: "🟩" },
  scramble: { key: "scramble", name: "Scramble", tag: "Unscramble it",         desc: "The letters of a word are jumbled — tap them in the right order to spell it out.", hue: "#8B5CF6", grad: ["#7C3AED", "#A855F7"], icon: "🔀" },
  ladder:   { key: "ladder",   name: "Ladder",   tag: "One letter at a time",  desc: "Turn the start word into the target, changing just one letter at a time — every step must be a real word.", hue: "#0EA5E9", grad: ["#0284C7", "#38BDF8"], icon: "🪜" },
  missing:  { key: "missing",  name: "Missing",  tag: "Fill the blanks",       desc: "Some letters are missing from a word. Use the clue to fill in the blanks.", hue: "#F59E0B", grad: ["#D97706", "#FBBF24"], icon: "🕳️" },
  blitz:    { key: "blitz",    name: "Blitz",    tag: "60-second word rush",   desc: "Make as many real words as you can from the letters before the 60-second clock runs out.", hue: "#F43F5E", grad: ["#E11D48", "#FB7185"], icon: "⚡" },
} as const;

export type GameKey = keyof typeof games;
export const CIRCUIT: GameKey[] = ["wordle", "scramble", "ladder", "missing", "blitz"];

export const gradients = {
  app: ["#0B0C10", "#12131C", "#0B0C10"],
  brand: ["#7C5CFF", "#5B8DEF"],
  gold: ["#F5B942", "#F59E0B"],
  score: ["#7C5CFF", "#9B86FF", "#5B8DEF"],
} as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = (n: number) => n * 4;

export const font = {
  // iOS system font; weights carry the hierarchy
  display: { fontSize: 40, fontWeight: "800" as const, letterSpacing: 1 },
  h1: { fontSize: 28, fontWeight: "800" as const },
  h2: { fontSize: 20, fontWeight: "700" as const },
  body: { fontSize: 16, fontWeight: "500" as const },
  label: { fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.4 },
  mono: { fontSize: 15, fontWeight: "700" as const, letterSpacing: 2 },
};

export const shadow = {
  card: { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  glow: (c: string) => ({ shadowColor: c, shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 10 }),
};
