export interface CellRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const VIEW_W = 400;
const VIEW_H = 300;
const PAD = 10;
const GAP = 10;
const HOUSE_H = 50;

export const SKETCH_VIEWBOX = `0 0 ${VIEW_W} ${VIEW_H}`;
export { VIEW_W, VIEW_H, HOUSE_H };

/**
 * Deterministic schematic packing — NOT derived from the parent's actual
 * yard dimensions (design doc §5.2/§10: free text has no structured
 * width/depth/shape). This is a conceptual "here are roughly how the
 * zones relate to each other" sketch, not a measured site plan — that
 * distinction matters so the free Phase 1 output doesn't read as the
 * same thing as the paid custom design package (PRD §7).
 */
export function yardLayout(zoneCount: number): CellRect[] {
  const innerX = PAD;
  const innerY = HOUSE_H;
  const innerW = VIEW_W - PAD * 2;
  const innerH = VIEW_H - HOUSE_H - PAD;

  if (zoneCount <= 1) {
    return [{ x: innerX, y: innerY, w: innerW, h: innerH }];
  }

  if (zoneCount === 2) {
    const w = (innerW - GAP) / 2;
    return [
      { x: innerX, y: innerY, w, h: innerH },
      { x: innerX + w + GAP, y: innerY, w, h: innerH },
    ];
  }

  if (zoneCount === 3) {
    const topH = innerH * 0.48;
    const botH = innerH - topH - GAP;
    const halfW = (innerW - GAP) / 2;
    return [
      { x: innerX, y: innerY, w: innerW, h: topH },
      { x: innerX, y: innerY + topH + GAP, w: halfW, h: botH },
      { x: innerX + halfW + GAP, y: innerY + topH + GAP, w: halfW, h: botH },
    ];
  }

  if (zoneCount === 4) {
    // 2x2 grid
    const cw = (innerW - GAP) / 2;
    const ch = (innerH - GAP) / 2;
    return [
      { x: innerX, y: innerY, w: cw, h: ch },
      { x: innerX + cw + GAP, y: innerY, w: cw, h: ch },
      { x: innerX, y: innerY + ch + GAP, w: cw, h: ch },
      { x: innerX + cw + GAP, y: innerY + ch + GAP, w: cw, h: ch },
    ];
  }

  // 5 zones (the taxonomy's max — see zones.ts) — top full-width strip, 2x2 grid below
  const topH = innerH * 0.34;
  const botH = innerH - topH - GAP;
  const cw = (innerW - GAP) / 2;
  const ch = (botH - GAP) / 2;
  const row1Y = innerY + topH + GAP;
  const row2Y = row1Y + ch + GAP;
  return [
    { x: innerX, y: innerY, w: innerW, h: topH },
    { x: innerX, y: row1Y, w: cw, h: ch },
    { x: innerX + cw + GAP, y: row1Y, w: cw, h: ch },
    { x: innerX, y: row2Y, w: cw, h: ch },
    { x: innerX + cw + GAP, y: row2Y, w: cw, h: ch },
  ];
}
