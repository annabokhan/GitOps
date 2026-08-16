import { makeRandom } from "./seededRandom";

export type Point = [number, number];

/** Smooths a closed polygon into a rounded, organic-looking outline (quadratic curve through edge midpoints). */
export function smoothClosedPath(points: Point[]): string {
  if (points.length < 3) return "";
  const last = points[points.length - 1];
  const first = points[0];
  let d = `M ${(last[0] + first[0]) / 2} ${(last[1] + first[1]) / 2} `;
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const mx = (curr[0] + next[0]) / 2;
    const my = (curr[1] + next[1]) / 2;
    d += `Q ${curr[0]} ${curr[1]} ${mx} ${my} `;
  }
  return d + "Z";
}

/** Irregular closed blob roughly filling an ellipse — used for zone shapes (garden-bed outlines, not rectangles). */
export function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number, jitter = 0.22, pointCount = 11): string {
  const rand = makeRandom(seed);
  const pts: Point[] = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const wobble = 1 - jitter / 2 + rand() * jitter;
    pts.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
  }
  return smoothClosedPath(pts);
}

/** Points along a gently-perturbed rectangle — used for the yard boundary (still reads as a fenced rectangle, not round). */
export function wobblyRectPoints(x: number, y: number, w: number, h: number, seed: number, jitter = 5, segmentsPerSide = 6): Point[] {
  const rand = makeRandom(seed);
  const pts: Point[] = [];
  const addEdge = (x1: number, y1: number, x2: number, y2: number) => {
    for (let i = 0; i < segmentsPerSide; i++) {
      const t = i / segmentsPerSide;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      pts.push([px + (rand() - 0.5) * jitter, py + (rand() - 0.5) * jitter]);
    }
  };
  addEdge(x, y, x + w, y);
  addEdge(x + w, y, x + w, y + h);
  addEdge(x + w, y + h, x, y + h);
  addEdge(x, y + h, x, y);
  return pts;
}
