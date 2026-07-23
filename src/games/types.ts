import { GameResult } from "../storage";
export type GameProps = {
  seed: number;
  onDone: (r: GameResult) => void;
  onClose: () => void;
  existing?: GameResult;
  restarts?: number; // times this game was restarted today (for the score penalty)
};
