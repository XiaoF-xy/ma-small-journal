import type { Player, RoundMode } from "./types";

export const seatLabels: Record<Player["seat"], string> = {
  east: "东",
  south: "南",
  west: "西",
  north: "北",
};

export const roundModes: Array<{ id: RoundMode; label: string; hint: string }> = [
  { id: "selfDraw", label: "自摸", hint: "三家支付" },
  { id: "discardWin", label: "点炮", hint: "一家支付" },
  { id: "exposedKong", label: "明杠", hint: "点杠支付" },
  { id: "concealedKong", label: "暗杠", hint: "三家支付" },
  { id: "adjustment", label: "调整", hint: "手动修正" },
];

