import { ANSWERS } from "./words";
import dict5 from "./data/dict5.json";
import dict4 from "./data/dict4.json";
import blitz from "./data/blitz.json";

// Validation dictionaries (real words) — permissive; guesses must be real words.
export const DICT5 = new Set<string>(dict5 as string[]);
export const DICT4 = new Set<string>(dict4 as string[]);
export const BLITZ_DICT = new Set<string>(blitz as string[]);

// Curated COMMON answers for the daily puzzles (uppercase).
export const WORDLE_ANSWERS = ANSWERS.map((w) => w.toUpperCase());
export const SCRAMBLE_WORDS = WORDLE_ANSWERS; // 5-letter common words, letters shuffled

// Missing: reveal some letters, blank the rest, give a hint.
export const MISSING: { word: string; hint: string }[] = [
  { word: "APPLE", hint: "A crisp orchard fruit" },
  { word: "OCEAN", hint: "A vast body of salt water" },
  { word: "TIGER", hint: "A big striped cat" },
  { word: "PIANO", hint: "88 keys" },
  { word: "RIVER", hint: "Flowing water to the sea" },
  { word: "CLOUD", hint: "It floats in the sky" },
  { word: "HONEY", hint: "Bees make it" },
  { word: "PLANT", hint: "It grows from a seed" },
  { word: "STORM", hint: "Wind, rain and thunder" },
  { word: "LEMON", hint: "A sour yellow citrus" },
  { word: "ROBOT", hint: "A machine that acts on its own" },
  { word: "BEACH", hint: "Sand meets the sea" },
  { word: "EAGLE", hint: "A soaring bird of prey" },
  { word: "MAPLE", hint: "Its syrup tops pancakes" },
  { word: "GHOST", hint: "A spooky spirit" },
  { word: "PEARL", hint: "A gem from an oyster" },
  { word: "CANDY", hint: "A sweet treat" },
  { word: "MONEY", hint: "You spend it" },
  { word: "NURSE", hint: "Cares for the sick" },
  { word: "TORCH", hint: "A handheld flame or light" },
  { word: "WHALE", hint: "The largest ocean mammal" },
  { word: "BRICK", hint: "A builder stacks these" },
  { word: "FLAME", hint: "The bright part of a fire" },
  { word: "GRAPE", hint: "Wine starts here" },
  { word: "CHAIR", hint: "You sit on it" },
  { word: "SUGAR", hint: "Sweetens your coffee" },
  { word: "NIGHT", hint: "The opposite of day" },
  { word: "OLIVE", hint: "A small fruit pressed for oil" },
  { word: "KNIFE", hint: "It cuts" },
  { word: "MEDAL", hint: "Awarded to winners" },
];

// Ladder: change one letter at a time from start to end (each step a real 4-letter word).
export const LADDERS: { start: string; end: string }[] = [
  { start: "COLD", end: "WARM" },
  { start: "HEAD", end: "TAIL" },
  { start: "LOVE", end: "HATE" },
  { start: "EAST", end: "WEST" },
  { start: "DARK", end: "LAMP" },
  { start: "FISH", end: "BIRD" }, // (harder — still solvable)
  { start: "WOOD", end: "COAL" },
  { start: "MILK", end: "WINE" },
  { start: "POOR", end: "RICH" },
  { start: "GOLD", end: "IRON" },
  { start: "SICK", end: "WELL" },
  { start: "FOUR", end: "FIVE" },
];

// Blitz: the letters of a 7-letter word form the daily set; find as many words as you can.
export const BLITZ_BASES = [
  "PICTURE", "MONSTER", "GARDENS", "PLANETS", "CRAYONS", "DIAMOND", "KITCHEN",
  "TROPICS", "MACHINE", "BEDROOM", "FLOWERS", "CAPTAIN", "HUSBAND", "LANTERN",
  "MORNING", "PADDLES", "QUARTER", "SANDBOX", "TRIBUNE", "VINTAGE",
  "WHISPER", "BALANCE", "CHAPTER", "DOLPHIN", "PELICAN",
];
