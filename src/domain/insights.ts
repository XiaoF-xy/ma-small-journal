import type { PlayerStats, TableState } from "./types";
import { getPlayerName, getPlayerStats } from "./scoring";

export function createLocalInsights(state: TableState): string[] {
  if (state.rounds.length === 0) {
    return ["还没有牌局记录，先记几局后这里会生成本地复盘。"];
  }

  const stats = getPlayerStats(state);
  const leader = maxBy(stats, (item) => item.total);
  const chaser = maxBy(stats, (item) => item.wins);
  const riskTaker = maxBy(stats, (item) => item.dealIns);
  const swingPlayer = maxBy(stats, (item) => item.biggestGain - item.biggestLoss);
  const insights: string[] = [];

  if (leader) {
    insights.push(`${getPlayerName(state, leader.playerId)} 当前领先 ${leader.total} 分，优势主要来自稳定净胜。`);
  }

  if (chaser && chaser.wins > 0) {
    insights.push(`${getPlayerName(state, chaser.playerId)} 胡牌次数最多，共 ${chaser.wins} 次，其中自摸 ${chaser.selfDraws} 次。`);
  }

  if (riskTaker && riskTaker.dealIns > 0) {
    insights.push(`${getPlayerName(state, riskTaker.playerId)} 点炮 ${riskTaker.dealIns} 次，后续可以观察是否需要收紧打法。`);
  }

  if (swingPlayer && swingPlayer.biggestGain > 0) {
    insights.push(
      `${getPlayerName(state, swingPlayer.playerId)} 单局最大进账 ${swingPlayer.biggestGain} 分，分数波动最明显。`,
    );
  }

  return insights.slice(0, 4);
}

function maxBy(items: PlayerStats[], getValue: (item: PlayerStats) => number): PlayerStats | null {
  return items.reduce<PlayerStats | null>((best, item) => {
    if (!best) return item;
    return getValue(item) > getValue(best) ? item : best;
  }, null);
}

