/**
 * ASL fingerspelling handshape data for the Holo avatar.
 *
 * Each letter is described at a semantic level (per-finger curl, spread,
 * thumb preset, wrist orientation) and mapped onto VRM humanoid bones by
 * the animator. Values are tuned visually against the normalized VRM rig.
 *
 * J and Z are approximated statically (their motion component is noted in
 * captions); this is a prototype and the UI says so.
 */

export type ThumbPreset =
  | "rest" // natural relaxed
  | "across" // folded across the palm (B, U, V, W …)
  | "side" // alongside the fist (A)
  | "out" // extended sideways (L, Y)
  | "up" // pointing up (K approximation)
  | "oppose"; // curved toward the fingertips (C, O, F)

export interface Handshape {
  /** Curl per finger, 0 = straight, 1 = full fist: [index, middle, ring, pinky]. */
  curls: [number, number, number, number];
  /** Sideways spread between index and middle (radians, + = apart). */
  spread?: number;
  thumb: ThumbPreset;
  /** Hand orientation: palm-out (default), sideways (G/H), or down (P/Q). */
  wrist?: "out" | "side" | "down";
}

const FIST: [number, number, number, number] = [1, 1, 1, 1];
const OPEN: [number, number, number, number] = [0, 0, 0, 0];

export const HANDSHAPES: Record<string, Handshape> = {
  A: { curls: FIST, thumb: "side" },
  B: { curls: OPEN, thumb: "across" },
  C: { curls: [0.5, 0.5, 0.5, 0.5], thumb: "oppose" },
  D: { curls: [0, 0.8, 0.8, 0.8], thumb: "oppose" },
  E: { curls: [0.85, 0.85, 0.85, 0.85], thumb: "across" },
  F: { curls: [0.6, 0, 0, 0], thumb: "oppose" },
  G: { curls: [0, 1, 1, 1], thumb: "side", wrist: "side" },
  H: { curls: [0, 0, 1, 1], thumb: "side", wrist: "side" },
  I: { curls: [1, 1, 1, 0], thumb: "across" },
  J: { curls: [1, 1, 1, 0], thumb: "across" }, // motion approximated
  K: { curls: [0, 0.25, 1, 1], spread: 0.25, thumb: "up" },
  L: { curls: [0, 1, 1, 1], thumb: "out" },
  M: { curls: [0.8, 0.8, 0.8, 0.9], thumb: "across" },
  N: { curls: [0.8, 0.8, 0.9, 0.95], thumb: "across" },
  O: { curls: [0.55, 0.55, 0.55, 0.55], thumb: "oppose" },
  P: { curls: [0, 0.25, 1, 1], spread: 0.25, thumb: "up", wrist: "down" },
  Q: { curls: [0, 1, 1, 1], thumb: "side", wrist: "down" },
  R: { curls: [0, 0, 1, 1], spread: -0.12, thumb: "across" },
  S: { curls: FIST, thumb: "across" },
  T: { curls: [0.9, 0.95, 1, 1], thumb: "up" },
  U: { curls: [0, 0, 1, 1], spread: 0, thumb: "across" },
  V: { curls: [0, 0, 1, 1], spread: 0.3, thumb: "across" },
  W: { curls: [0, 0, 0, 1], spread: 0.22, thumb: "across" },
  X: { curls: [0.5, 1, 1, 1], thumb: "across" },
  Y: { curls: [1, 1, 1, 0], thumb: "out" },
  Z: { curls: [0, 1, 1, 1], thumb: "side" }, // motion approximated
};

/** Relaxed hand used between letters and at rest. */
export const REST_SHAPE: Handshape = {
  curls: [0.25, 0.25, 0.3, 0.3],
  thumb: "rest",
};
