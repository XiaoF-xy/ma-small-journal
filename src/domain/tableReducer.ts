import { seatLabels } from "./constants";
import { buildRound } from "./scoring";
import { createInitialState } from "./storage";
import type { RoundDraft, RuleSet, TableState } from "./types";

export type TableAction =
  | { type: "set-table-name"; name: string }
  | { type: "rename-player"; playerId: string; name: string }
  | { type: "set-rules"; rules: RuleSet }
  | { type: "add-round"; draft: RoundDraft }
  | { type: "undo-last-round" }
  | { type: "reset-table" }
  | { type: "replace-state"; state: TableState };

export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "set-table-name":
      return { ...state, tableName: action.name };
    case "rename-player":
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId ? { ...player, name: action.name.trim() || seatLabels[player.seat] } : player,
        ),
      };
    case "set-rules":
      return { ...state, rules: action.rules };
    case "add-round": {
      const round = buildRound(state, action.draft);
      if (!round) return state;
      return { ...state, rounds: [round, ...state.rounds] };
    }
    case "undo-last-round":
      return { ...state, rounds: state.rounds.slice(1) };
    case "reset-table":
      return createInitialState();
    case "replace-state":
      return action.state;
  }
}

