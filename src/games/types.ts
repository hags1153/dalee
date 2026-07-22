import { GameResult } from "../storage";
export type GameProps = {
  seed: number;
  onDone: (r: GameResult) => void;
  onClose: () => void;
  existing?: GameResult;
};
