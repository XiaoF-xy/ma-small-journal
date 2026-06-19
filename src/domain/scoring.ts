import type { PlayerStats, RoundDraft, RoundEntry, RoundMode, TableState } from "./types";

const modeLabels: Record<RoundMode, string> = {
  selfDraw: "自摸",
  discardWin: "点炮胡",
  exposedKong: "明杠",
  concealedKong: "暗杠",
  adjustment: "调整",
};

export function createId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyDeltas(state: TableState): Record<string, number> {
  return Object.fromEntries(state.players.map((player) => [player.id, 0]));
}

export function buildRound(state: TableState, draft: RoundDraft): RoundEntry | null {
  const actor = state.players.find((player) => player.id === draft.actorId);
  if (!actor) return null;

  const deltas = createEmptyDeltas(state);
  const points = Math.max(1, Math.floor(draft.points || state.rules.basePoint));

  if (draft.mode === "adjustment") {
    for (const player of state.players) {
      deltas[player.id] = Number(draft.adjustmentDeltas[player.id] || 0);
    }

    if (Object.values(deltas).every((delta) => delta === 0)) return null;
  }

  if (draft.mode === "selfDraw") {
    for (const player of state.players) {
      deltas[player.id] += player.id === actor.id ? points * 3 : -points;
    }
  }

  if (draft.mode === "discardWin") {
    if (!draft.payerId || draft.payerId === actor.id) return null;
    deltas[actor.id] += points;
    deltas[draft.payerId] -= points;
  }

  if (draft.mode === "exposedKong") {
    if (!draft.payerId || draft.payerId === actor.id) return null;
    const kongPoint = Math.max(1, Math.floor(state.rules.exposedKongPoint));
    deltas[actor.id] += kongPoint;
    deltas[draft.payerId] -= kongPoint;
  }

  if (draft.mode === "concealedKong") {
    const kongPoint = Math.max(1, Math.floor(state.rules.concealedKongPoint));
    for (const player of state.players) {
      deltas[player.id] += player.id === actor.id ? kongPoint * 3 : -kongPoint;
    }
  }

  return {
    id: createId(),
    mode: draft.mode,
    actorId: actor.id,
    payerId: draft.mode === "discardWin" || draft.mode === "exposedKong" ? draft.payerId : null,
    points: draft.mode === "adjustment" ? 0 : points,
    note: draft.note.trim(),
    deltas,
    createdAt: new Date().toISOString(),
  };
}

export function getTotals(state: TableState): Record<string, number> {
  const totals = createEmptyDeltas(state);
  for (const round of state.rounds) {
    for (const [playerId, delta] of Object.entries(round.deltas)) {
      totals[playerId] = (totals[playerId] ?? 0) + delta;
    }
  }
  return totals;
}

export function getPlayerStats(state: TableState): PlayerStats[] {
  const totals = getTotals(state);

  return state.players.map((player) => {
    const roundsForPlayer = state.rounds.map((round) => round.deltas[player.id] ?? 0);

    return {
      playerId: player.id,
      total: totals[player.id] ?? 0,
      wins: state.rounds.filter(
        (round) => round.actorId === player.id && (round.mode === "selfDraw" || round.mode === "discardWin"),
      ).length,
      selfDraws: state.rounds.filter((round) => round.actorId === player.id && round.mode === "selfDraw").length,
      dealIns: state.rounds.filter((round) => round.payerId === player.id && round.mode === "discardWin").length,
      kongs: state.rounds.filter(
        (round) => round.actorId === player.id && (round.mode === "exposedKong" || round.mode === "concealedKong"),
      ).length,
      biggestGain: Math.max(0, ...roundsForPlayer),
      biggestLoss: Math.min(0, ...roundsForPlayer),
    };
  });
}

export function getScoreTrend(state: TableState): Record<string, number[]> {
  const trend = Object.fromEntries(state.players.map((player) => [player.id, [0]]));
  const chronologicalRounds = [...state.rounds].reverse();
  const running = createEmptyDeltas(state);

  for (const round of chronologicalRounds) {
    for (const player of state.players) {
      running[player.id] += round.deltas[player.id] ?? 0;
      trend[player.id].push(running[player.id]);
    }
  }

  return trend;
}

export function getRoundTitle(state: TableState, round: RoundEntry): string {
  const actor = getPlayerName(state, round.actorId);
  if (round.mode === "discardWin") return `${actor} 胡 ${getPlayerName(state, round.payerId)} 点炮`;
  if (round.mode === "exposedKong") return `${actor} 明杠 ${getPlayerName(state, round.payerId)}`;
  if (round.mode === "adjustment") return "手动调整";
  return `${actor} ${modeLabels[round.mode]}`;
}

export function getModeLabel(mode: RoundMode): string {
  return modeLabels[mode];
}

export function getPlayerName(state: TableState, playerId: string | null): string {
  return state.players.find((player) => player.id === playerId)?.name ?? "未知玩家";
}

export function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}

