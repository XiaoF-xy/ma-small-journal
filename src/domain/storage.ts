import type { TableState } from "./types";
import { createId } from "./scoring";

export const STORAGE_KEY = "ma-small-journal:table:v2";

export function createInitialState(): TableState {
  return {
    version: 1,
    tableName: "今晚这桌",
    players: [
      { id: createId(), name: "东家", seat: "east" },
      { id: createId(), name: "南家", seat: "south" },
      { id: createId(), name: "西家", seat: "west" },
      { id: createId(), name: "北家", seat: "north" },
    ],
    rules: {
      basePoint: 1,
      exposedKongPoint: 1,
      concealedKongPoint: 2,
    },
    rounds: [],
  };
}

export function loadTableState(): TableState {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return createInitialState();

  try {
    const parsed = JSON.parse(stored) as TableState;
    if (parsed.version === 1 && Array.isArray(parsed.players) && Array.isArray(parsed.rounds)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return createInitialState();
}

export function saveTableState(state: TableState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function parseImportedState(raw: string): TableState | null {
  try {
    const parsed = JSON.parse(raw) as TableState;
    if (parsed.version === 1 && parsed.players?.length === 4 && Array.isArray(parsed.rounds)) return parsed;
  } catch {
    return null;
  }

  return null;
}

