export type Seat = "east" | "south" | "west" | "north";

export type RoundMode = "selfDraw" | "discardWin" | "exposedKong" | "concealedKong" | "adjustment";

export interface Player {
  id: string;
  name: string;
  seat: Seat;
}

export interface RuleSet {
  basePoint: number;
  exposedKongPoint: number;
  concealedKongPoint: number;
}

export interface RoundEntry {
  id: string;
  mode: RoundMode;
  actorId: string;
  payerId: string | null;
  points: number;
  note: string;
  deltas: Record<string, number>;
  createdAt: string;
}

export interface TableState {
  version: 1;
  tableName: string;
  players: Player[];
  rules: RuleSet;
  rounds: RoundEntry[];
}

export interface RoundDraft {
  mode: RoundMode;
  actorId: string;
  payerId: string;
  points: number;
  note: string;
  adjustmentDeltas: Record<string, number>;
}

export interface PlayerStats {
  playerId: string;
  total: number;
  wins: number;
  selfDraws: number;
  dealIns: number;
  kongs: number;
  biggestGain: number;
  biggestLoss: number;
}

