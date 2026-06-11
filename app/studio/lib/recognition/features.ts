import type { NormalizedLandmark } from "./handLandmarker";

/**
 * Compact geometric description of a hand pose, derived from MediaPipe's
 * 21 landmarks. All values are normalized to ~0..1 so letter templates
 * can be authored and compared dimension-by-dimension.
 */
export interface HandFeatures {
  /** Extension of index/middle/ring/pinky: 0 = fully curled, 1 = straight. */
  curls: [number, number, number, number];
  /** Thumb reach away from the palm: 0 = folded across, 1 = fully out. */
  thumbExt: number;
  /** Closeness of thumb tip to index tip: 1 = touching (F/O circle). */
  thumbIndexTouch: number;
  /** Closeness of thumb tip to middle tip (E/O cluster, T). */
  thumbMiddleTouch: number;
  /** Closeness of thumb tip to pinky tip (Y excludes, E includes). */
  thumbPinkyTouch: number;
  /** Angular spread between index and middle fingers: 1 = wide (V/W). */
  indexMiddleSpread: number;
  /** Angular spread between middle and ring fingers (W). */
  middleRingSpread: number;
  /** 1 = fingers point up, 0 = sideways/down (G/H/P/Q discrimination). */
  upright: number;
  /** Closeness of index tip to middle tip while both extended (R/U). */
  indexMiddleTouch: number;
}

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_TIP = 20;

type Vec = { x: number; y: number; z: number };

function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function angleBetween(a: Vec, b: Vec): number {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  const la = Math.hypot(a.x, a.y, a.z);
  const lb = Math.hypot(b.x, b.y, b.z);
  if (la === 0 || lb === 0) return 0;
  return Math.acos(Math.min(1, Math.max(-1, dot / (la * lb))));
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Maps a raw ratio range onto 0..1. */
function norm(v: number, lo: number, hi: number): number {
  return clamp01((v - lo) / (hi - lo));
}

function fingerCurl(
  lm: NormalizedLandmark[],
  mcp: number,
  pip: number,
  dip: number,
  tip: number,
): number {
  const m = lm[mcp];
  const p = lm[pip];
  const d = lm[dip];
  const t = lm[tip];
  if (!m || !p || !d || !t) return 0;
  const chain = dist(m, p) + dist(p, d) + dist(d, t);
  if (chain === 0) return 0;
  // Straight finger: tip-to-MCP distance ≈ chain length. Curled: much shorter.
  return norm(dist(m, t) / chain, 0.45, 0.95);
}

/** Extracts pose features from one hand's landmarks. Orientation-tolerant
 *  where possible: distances are normalized by palm size. */
export function extractFeatures(lm: NormalizedLandmark[]): HandFeatures | null {
  const wrist = lm[WRIST];
  const middleMcp = lm[MIDDLE_MCP];
  const thumbTip = lm[THUMB_TIP];
  const indexTip = lm[INDEX_TIP];
  const middleTip = lm[MIDDLE_TIP];
  const pinkyTip = lm[PINKY_TIP];
  const pinkyMcp = lm[PINKY_MCP];
  const indexMcp = lm[INDEX_MCP];
  const ringMcp = lm[RING_MCP];
  const ringTip = lm[RING_TIP];
  if (
    !wrist || !middleMcp || !thumbTip || !indexTip || !middleTip ||
    !pinkyTip || !pinkyMcp || !indexMcp || !ringMcp || !ringTip
  ) {
    return null;
  }

  const palm = dist(wrist, middleMcp);
  if (palm === 0) return null;

  const curls: [number, number, number, number] = [
    fingerCurl(lm, 5, 6, 7, 8),
    fingerCurl(lm, 9, 10, 11, 12),
    fingerCurl(lm, 13, 14, 15, 16),
    fingerCurl(lm, 17, 18, 19, 20),
  ];

  // Thumb reach: distance from thumb tip to the pinky MCP, in palm units.
  // Folded across the palm ≈ 0.1–0.3; extended out (L/Y) ≈ 1.0–1.3.
  const thumbExt = norm(dist(thumbTip, pinkyMcp) / palm, 0.3, 1.1);

  const touch = (a: Vec, b: Vec) => 1 - norm(dist(a, b) / palm, 0.2, 0.7);

  const up = sub(middleMcp, wrist);
  const upright = norm(-up.y / Math.hypot(up.x, up.y, up.z), 0.4, 0.9);

  const middleDir = sub(middleTip, middleMcp);
  const ringDir = sub(ringTip, ringMcp);

  return {
    curls,
    thumbExt,
    thumbIndexTouch: touch(thumbTip, indexTip),
    thumbMiddleTouch: touch(thumbTip, middleTip),
    thumbPinkyTouch: touch(thumbTip, pinkyTip),
    indexMiddleSpread: norm(
      angleBetween(sub(indexTip, indexMcp), middleDir),
      0.1,
      0.45,
    ),
    middleRingSpread: norm(angleBetween(middleDir, ringDir), 0.1, 0.4),
    upright,
    indexMiddleTouch: touch(indexTip, middleTip),
  };
}

// Re-exported for the classifier's hook-detection special case.
export const INDEX = { MCP: INDEX_MCP, PIP: INDEX_PIP, DIP: INDEX_DIP, TIP: INDEX_TIP };
