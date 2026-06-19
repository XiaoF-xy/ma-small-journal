import { useEffect, useMemo, useReducer, useState } from "react";
import {
  buildRound,
  formatScore,
  getModeLabel,
  getPlayerStats,
  getRoundTitle,
  getScoreTrend,
  getTotals,
} from "./domain/scoring";
import { loadTableState, parseImportedState, saveTableState } from "./domain/storage";
import type { Player, RoundDraft, RuleSet, TableState } from "./domain/types";
import { createLocalInsights } from "./domain/insights";
import { roundModes, seatLabels } from "./domain/constants";
import { createDefaultDraft, normalizeDraft } from "./domain/draft";
import { tableReducer } from "./domain/tableReducer";

export default function App() {
  const [state, dispatch] = useReducer(tableReducer, undefined, loadTableState);
  const [draft, setDraft] = useState(() => createDefaultDraft(state));
  const [importText, setImportText] = useState("");
  const totals = useMemo(() => getTotals(state), [state]);
  const stats = useMemo(() => getPlayerStats(state), [state]);
  const trend = useMemo(() => getScoreTrend(state), [state]);
  const insights = useMemo(() => createLocalInsights(state), [state]);
  const previewRound = useMemo(() => buildRound(state, draft), [state, draft]);

  useEffect(() => {
    saveTableState(state);
  }, [state]);

  useEffect(() => {
    setDraft((current) => normalizeDraft(current, state));
  }, [state.players, state.rules.basePoint]);

  function addRound() {
    dispatch({ type: "add-round", draft });
    setDraft(createDefaultDraft(state));
  }

  function exportTable() {
    const payload = JSON.stringify(state, null, 2);
    void navigator.clipboard?.writeText(payload);
    setImportText(payload);
  }

  function importTable() {
    const imported = parseImportedState(importText);
    if (!imported) return;
    dispatch({ type: "replace-state", state: imported });
    setDraft(createDefaultDraft(imported));
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <div className="title-block">
          <img className="brand-mark" src="/mahjong-mark.svg" alt="" />
          <div>
            <p className="eyebrow">Changshu Mahjong Journal</p>
            <input
              className="table-name"
              value={state.tableName}
              onChange={(event) => dispatch({ type: "set-table-name", name: event.target.value })}
              aria-label="牌桌名称"
            />
            <h1 id="app-title">常熟麻将记分</h1>
          </div>
        </div>
        <div className="hero-actions">
          <button className="icon-button" type="button" onClick={() => dispatch({ type: "undo-last-round" })}>
            ↶
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => {
              if (window.confirm("确定清空当前这桌数据吗？")) dispatch({ type: "reset-table" });
            }}
          >
            清空
          </button>
        </div>
      </section>

      <section className="score-grid" aria-label="玩家分数">
        {state.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            total={totals[player.id] ?? 0}
            stat={stats.find((item) => item.playerId === player.id)}
            onRename={(name) => dispatch({ type: "rename-player", playerId: player.id, name })}
          />
        ))}
      </section>

      <section className="layout">
        <div className="left-stack">
          <ScoreEntry
            state={state}
            draft={draft}
            previewDeltas={previewRound?.deltas ?? null}
            onDraftChange={setDraft}
            onSubmit={addRound}
          />
          <RulePanel
            rules={state.rules}
            onChange={(rules) => {
              dispatch({ type: "set-rules", rules });
              setDraft((current) => ({ ...current, points: rules.basePoint }));
            }}
          />
          <DataPanel
            importText={importText}
            onImportTextChange={setImportText}
            onExport={exportTable}
            onImport={importTable}
          />
        </div>

        <div className="right-stack">
          <InsightsPanel insights={insights} />
          <TrendPanel state={state} trend={trend} />
          <HistoryPanel state={state} />
        </div>
      </section>
    </main>
  );
}

function PlayerCard({
  player,
  total,
  stat,
  onRename,
}: {
  player: Player;
  total: number;
  stat?: ReturnType<typeof getPlayerStats>[number];
  onRename: (name: string) => void;
}) {
  return (
    <article className="player-card">
      <div className="seat-badge">{seatLabels[player.seat]}</div>
      <label>
        <span>玩家</span>
        <input value={player.name} onChange={(event) => onRename(event.target.value)} maxLength={8} />
      </label>
      <strong className={scoreClassName(total)}>{formatScore(total)}</strong>
      <dl className="mini-stats">
        <div>
          <dt>胡</dt>
          <dd>{stat?.wins ?? 0}</dd>
        </div>
        <div>
          <dt>自摸</dt>
          <dd>{stat?.selfDraws ?? 0}</dd>
        </div>
        <div>
          <dt>点炮</dt>
          <dd>{stat?.dealIns ?? 0}</dd>
        </div>
      </dl>
    </article>
  );
}

function ScoreEntry({
  state,
  draft,
  previewDeltas,
  onDraftChange,
  onSubmit,
}: {
  state: TableState;
  draft: RoundDraft;
  previewDeltas: Record<string, number> | null;
  onDraftChange: (draft: RoundDraft) => void;
  onSubmit: () => void;
}) {
  const needsPayer = draft.mode === "discardWin" || draft.mode === "exposedKong";
  const needsPoints = draft.mode === "selfDraw" || draft.mode === "discardWin";
  const isAdjustment = draft.mode === "adjustment";

  return (
    <section className="panel entry-panel" aria-labelledby="entry-title">
      <div className="panel-heading">
        <h2 id="entry-title">新增记录</h2>
        <span>{getModeLabel(draft.mode)}</span>
      </div>

      <div className="mode-grid" role="tablist" aria-label="结算类型">
        {roundModes.map((mode) => (
          <button
            key={mode.id}
            className={mode.id === draft.mode ? "mode-button active" : "mode-button"}
            type="button"
            onClick={() => onDraftChange(normalizeDraft({ ...draft, mode: mode.id }, state))}
          >
            <strong>{mode.label}</strong>
            <span>{mode.hint}</span>
          </button>
        ))}
      </div>

      <div className="form-grid">
        {!isAdjustment && (
          <label>
            操作玩家
            <select value={draft.actorId} onChange={(event) => onDraftChange(normalizeDraft({ ...draft, actorId: event.target.value }, state))}>
              {state.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {needsPayer && (
          <label>
            支付玩家
            <select value={draft.payerId} onChange={(event) => onDraftChange(normalizeDraft({ ...draft, payerId: event.target.value }, state))}>
              {state.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {needsPoints && (
          <label>
            分值
            <input
              type="number"
              min={1}
              step={1}
              value={draft.points}
              onChange={(event) => onDraftChange({ ...draft, points: Number(event.target.value) })}
            />
          </label>
        )}

        <label>
          备注
          <input
            value={draft.note}
            onChange={(event) => onDraftChange({ ...draft, note: event.target.value })}
            maxLength={32}
            placeholder="可选"
          />
        </label>
      </div>

      {isAdjustment && (
        <div className="adjustment-grid">
          {state.players.map((player) => (
            <label key={player.id}>
              {player.name}
              <input
                type="number"
                step={1}
                value={draft.adjustmentDeltas[player.id] ?? 0}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    adjustmentDeltas: {
                      ...draft.adjustmentDeltas,
                      [player.id]: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      )}

      <PreviewDeltas state={state} deltas={previewDeltas} />
      <button className="primary-button" type="button" onClick={onSubmit}>
        入账
      </button>
    </section>
  );
}

function RulePanel({ rules, onChange }: { rules: RuleSet; onChange: (rules: RuleSet) => void }) {
  return (
    <section className="panel" aria-labelledby="rules-title">
      <div className="panel-heading">
        <h2 id="rules-title">本桌规则</h2>
      </div>
      <div className="form-grid">
        <label>
          默认胡牌分
          <input type="number" min={1} value={rules.basePoint} onChange={(event) => onChange({ ...rules, basePoint: Number(event.target.value) })} />
        </label>
        <label>
          明杠分
          <input
            type="number"
            min={1}
            value={rules.exposedKongPoint}
            onChange={(event) => onChange({ ...rules, exposedKongPoint: Number(event.target.value) })}
          />
        </label>
        <label>
          暗杠分
          <input
            type="number"
            min={1}
            value={rules.concealedKongPoint}
            onChange={(event) => onChange({ ...rules, concealedKongPoint: Number(event.target.value) })}
          />
        </label>
      </div>
    </section>
  );
}

function PreviewDeltas({ state, deltas }: { state: TableState; deltas: Record<string, number> | null }) {
  return (
    <div className="preview-strip">
      {state.players.map((player) => {
        const delta = deltas?.[player.id] ?? 0;
        return (
          <div key={player.id}>
            <span>{player.name}</span>
            <strong className={scoreClassName(delta)}>{formatScore(delta)}</strong>
          </div>
        );
      })}
    </div>
  );
}

function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <section className="panel insights-panel" aria-labelledby="insights-title">
      <div className="panel-heading">
        <h2 id="insights-title">本地复盘</h2>
        <span>规则分析</span>
      </div>
      <ul>
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </section>
  );
}

function TrendPanel({ state, trend }: { state: TableState; trend: Record<string, number[]> }) {
  const allValues = Object.values(trend).flat();
  const min = Math.min(0, ...allValues);
  const max = Math.max(0, ...allValues);
  const range = Math.max(1, max - min);

  return (
    <section className="panel" aria-labelledby="trend-title">
      <div className="panel-heading">
        <h2 id="trend-title">分数走势</h2>
        <span>{state.rounds.length} 局</span>
      </div>
      <div className="trend-grid">
        {state.players.map((player, index) => {
          const points = trend[player.id] ?? [0];
          return (
            <div className="trend-row" key={player.id}>
              <span>{player.name}</span>
              <svg viewBox="0 0 240 42" preserveAspectRatio="none">
                <polyline points={toPolyline(points, min, range)} className={`trend-line trend-${index}`} />
              </svg>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HistoryPanel({ state }: { state: TableState }) {
  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <h2 id="history-title">牌局记录</h2>
        <span>{state.rounds.length} 局</span>
      </div>
      <ol className="round-list">
        {state.rounds.length === 0 && <li className="round-item empty">还没有记录。</li>}
        {state.rounds.map((round) => (
          <li className="round-item" key={round.id}>
            <div>
              <strong>{getRoundTitle(state, round)}</strong>
              <p>
                {new Date(round.createdAt).toLocaleString("zh-CN", { hour12: false })}
                {round.points > 0 ? ` · ${round.points} 分` : ""}
                {round.note ? ` · ${round.note}` : ""}
              </p>
            </div>
            <dl>
              {state.players.map((player) => (
                <div key={player.id}>
                  <dt>{player.name}</dt>
                  <dd className={scoreClassName(round.deltas[player.id] ?? 0)}>{formatScore(round.deltas[player.id] ?? 0)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DataPanel({
  importText,
  onImportTextChange,
  onExport,
  onImport,
}: {
  importText: string;
  onImportTextChange: (value: string) => void;
  onExport: () => void;
  onImport: () => void;
}) {
  return (
    <section className="panel" aria-labelledby="data-title">
      <div className="panel-heading">
        <h2 id="data-title">备份</h2>
        <button className="ghost-button" type="button" onClick={onExport}>
          导出
        </button>
      </div>
      <textarea value={importText} onChange={(event) => onImportTextChange(event.target.value)} placeholder="粘贴导出的牌桌 JSON" />
      <button className="secondary-button" type="button" onClick={onImport}>
        导入这桌
      </button>
    </section>
  );
}

function scoreClassName(score: number): string {
  if (score > 0) return "score positive";
  if (score < 0) return "score negative";
  return "score";
}

function toPolyline(values: number[], min: number, range: number): string {
  const width = 240;
  const height = 42;
  const lastIndex = Math.max(1, values.length - 1);

  return values
    .map((value, index) => {
      const x = (index / lastIndex) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
