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

// Legacy Missing word list, kept for compatibility with older selectors.
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

export type MiniCrosswordEntry = {
  id: string;
  clue: string;
  answer: string;
  row: number;
  col: number;
  dir: "across" | "down";
};

export type MiniCrossword = {
  grid: string[];
  entries: MiniCrosswordEntry[];
};

export const MINI_CROSSWORDS: MiniCrossword[] = [
  {
    grid: [
      "CAT..",
      "A....",
      "RIVER",
      "D....",
      "STAR.",
    ],
    entries: [
      { id: "1A", clue: "Small house pet", answer: "CAT", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Flowing water", answer: "RIVER", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Night-sky point", answer: "STAR", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Greeting card items", answer: "CARDS", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "MOON.",
      "A....",
      "PILOT",
      "L....",
      "EAST.",
    ],
    entries: [
      { id: "1A", clue: "It orbits Earth", answer: "MOON", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Flies a plane", answer: "PILOT", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Sunrise direction", answer: "EAST", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Tree with syrup", answer: "MAPLE", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "BREAD",
      "R....",
      "USHER",
      "S....",
      "HONEY",
    ],
    entries: [
      { id: "1A", clue: "Bakery loaf", answer: "BREAD", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Shows you to a seat", answer: "USHER", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Bees make it", answer: "HONEY", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Make-up brush", answer: "BRUSH", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "LIGHT",
      "E....",
      "MONEY",
      "O....",
      "NORTH",
    ],
    entries: [
      { id: "1A", clue: "Not heavy, or bright", answer: "LIGHT", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "You spend it", answer: "MONEY", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Compass point", answer: "NORTH", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Sour yellow fruit", answer: "LEMON", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "PIANO",
      "L....",
      "APPLE",
      "N....",
      "TIGER",
    ],
    entries: [
      { id: "1A", clue: "Instrument with keys", answer: "PIANO", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Orchard fruit", answer: "APPLE", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Striped big cat", answer: "TIGER", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "It grows from a seed", answer: "PLANT", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "RIVER",
      "O....",
      "BEACH",
      "O....",
      "TORCH",
    ],
    entries: [
      { id: "1A", clue: "Flowing water", answer: "RIVER", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Sand meets the sea", answer: "BEACH", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Handheld flame", answer: "TORCH", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Machine that acts on its own", answer: "ROBOT", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "CHAIR",
      "L....",
      "OLIVE",
      "U....",
      "DANCE",
    ],
    entries: [
      { id: "1A", clue: "You sit on it", answer: "CHAIR", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Small fruit pressed for oil", answer: "OLIVE", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Move to music", answer: "DANCE", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "It floats in the sky", answer: "CLOUD", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "HOUSE",
      "O....",
      "NURSE",
      "E....",
      "YACHT",
    ],
    entries: [
      { id: "1A", clue: "Where people live", answer: "HOUSE", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Cares for the sick", answer: "NURSE", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Sailing boat", answer: "YACHT", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Bees make it", answer: "HONEY", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "FIELD",
      "L....",
      "AMBER",
      "M....",
      "EAGLE",
    ],
    entries: [
      { id: "1A", clue: "Open grassy land", answer: "FIELD", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Golden-orange color", answer: "AMBER", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Soaring bird of prey", answer: "EAGLE", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Bright part of a fire", answer: "FLAME", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "BLOOM",
      "R....",
      "IVORY",
      "C....",
      "KNIFE",
    ],
    entries: [
      { id: "1A", clue: "Flower opening", answer: "BLOOM", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Creamy white color", answer: "IVORY", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Kitchen cutter", answer: "KNIFE", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "Builder stacks these", answer: "BRICK", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "WHALE",
      "O....",
      "RADIO",
      "L....",
      "DREAM",
    ],
    entries: [
      { id: "1A", clue: "Largest ocean mammal", answer: "WHALE", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "Broadcast receiver", answer: "RADIO", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Sleep story", answer: "DREAM", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "The whole planet", answer: "WORLD", row: 0, col: 0, dir: "down" },
    ],
  },
  {
    grid: [
      "OCEAN",
      "N....",
      "ISSUE",
      "O....",
      "NOVEL",
    ],
    entries: [
      { id: "1A", clue: "Vast salt water", answer: "OCEAN", row: 0, col: 0, dir: "across" },
      { id: "2A", clue: "A problem or topic", answer: "ISSUE", row: 2, col: 0, dir: "across" },
      { id: "3A", clue: "Long fiction book", answer: "NOVEL", row: 4, col: 0, dir: "across" },
      { id: "1D", clue: "A small fruit with layers", answer: "ONION", row: 0, col: 0, dir: "down" },
    ],
  },
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
