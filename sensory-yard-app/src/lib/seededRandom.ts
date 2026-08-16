/**
 * Deterministic PRNG. YardSketch is a client component but still goes
 * through SSR + hydration — Math.random() would compute a different
 * value on the server than on the client and produce a hydration
 * mismatch (and a visible "flash" of different shapes). Seeding from
 * stable inputs (report id, zone id) keeps server and client in sync
 * while still varying the illustration per report.
 */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRandom(seed: number): () => number {
  let s = seed || 1;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
