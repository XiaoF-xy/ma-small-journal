import type { RoundDraft, TableState } from "./types";

export function createDefaultDraft(state: TableState): RoundDraft {
  const actorId = state.players[0]?.id ?? "";
  const payerId = state.players.find((player) => player.id !== actorId)?.id ?? "";

  return {
    mode: "selfDraw",
    actorId,
    payerId,
    points: state.rules.basePoint,
    note: "",
    adjustmentDeltas: Object.fromEntries(state.players.map((player) => [player.id, 0])),
  };
}

export function normalizeDraft(draft: RoundDraft, state: TableState): RoundDraft {
  const actorId = state.players.some((player) => player.id === draft.actorId) ? draft.actorId : state.players[0]?.id;
  const payerFallback = state.players.find((player) => player.id !== actorId)?.id ?? "";
  const payerId = draft.payerId && draft.payerId !== actorId ? draft.payerId : payerFallback;

  return {
    ...draft,
    actorId: actorId ?? "",
    payerId,
    points: Number.isFinite(draft.points) && draft.points > 0 ? draft.points : state.rules.basePoint,
    adjustmentDeltas: {
      ...Object.fromEntries(state.players.map((player) => [player.id, 0])),
      ...draft.adjustmentDeltas,
    },
  };
}

