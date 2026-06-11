import type { HandFeatures } from "./features";

/**
 * Template definitions for the static ASL fingerspelling alphabet.
 * J and Z require motion and are intentionally excluded from v1 —
 * the UI is explicit about this.
 *
 * Each template lists target feature values with per-feature weights.
 * Unlisted features are ignored for that letter. Values are authored from
 * the geometry of each handshape and are meant to be tuned against real
 * webcam data — the hold-to-commit interaction absorbs residual noise.
 */

export type FeatureKey =
  | "curlIndex"
  | "curlMiddle"
  | "curlRing"
  | "curlPinky"
  | "thumbExt"
  | "thumbIndexTouch"
  | "thumbMiddleTouch"
  | "thumbPinkyTouch"
  | "indexMiddleSpread"
  | "middleRingSpread"
  | "upright"
  | "indexMiddleTouch";

export interface LetterTemplate {
  letter: string;
  targets: Partial<Record<FeatureKey, number>>;
  /** Multiplier on the default weight for the listed features. */
  emphasis?: Partial<Record<FeatureKey, number>>;
}

export function flatten(f: HandFeatures): Record<FeatureKey, number> {
  return {
    curlIndex: f.curls[0],
    curlMiddle: f.curls[1],
    curlRing: f.curls[2],
    curlPinky: f.curls[3],
    thumbExt: f.thumbExt,
    thumbIndexTouch: f.thumbIndexTouch,
    thumbMiddleTouch: f.thumbMiddleTouch,
    thumbPinkyTouch: f.thumbPinkyTouch,
    indexMiddleSpread: f.indexMiddleSpread,
    middleRingSpread: f.middleRingSpread,
    upright: f.upright,
    indexMiddleTouch: f.indexMiddleTouch,
  };
}

const fist = {
  curlIndex: 0,
  curlMiddle: 0,
  curlRing: 0,
  curlPinky: 0,
} as const;

const allUp = {
  curlIndex: 1,
  curlMiddle: 1,
  curlRing: 1,
  curlPinky: 1,
} as const;

export const ALPHABET: LetterTemplate[] = [
  {
    letter: "A",
    targets: { ...fist, thumbExt: 0.55, thumbIndexTouch: 0.3, upright: 1 },
    emphasis: { thumbExt: 1.4 },
  },
  {
    letter: "B",
    targets: { ...allUp, thumbExt: 0.1, indexMiddleSpread: 0.1, upright: 1 },
    emphasis: { thumbExt: 1.5, indexMiddleSpread: 1.2 },
  },
  {
    letter: "C",
    targets: {
      curlIndex: 0.55,
      curlMiddle: 0.55,
      curlRing: 0.55,
      curlPinky: 0.55,
      thumbExt: 0.6,
      thumbIndexTouch: 0.25,
    },
    emphasis: { curlIndex: 1.3, curlMiddle: 1.3 },
  },
  {
    letter: "D",
    targets: {
      curlIndex: 1,
      curlMiddle: 0.2,
      curlRing: 0.2,
      curlPinky: 0.2,
      thumbMiddleTouch: 0.9,
      upright: 1,
    },
    emphasis: { curlIndex: 1.5, thumbMiddleTouch: 1.2 },
  },
  {
    letter: "E",
    targets: {
      curlIndex: 0.15,
      curlMiddle: 0.15,
      curlRing: 0.15,
      curlPinky: 0.15,
      thumbExt: 0.15,
      thumbMiddleTouch: 0.6,
      upright: 1,
    },
    emphasis: { thumbExt: 1.3 },
  },
  {
    letter: "F",
    targets: {
      curlIndex: 0.35,
      curlMiddle: 1,
      curlRing: 1,
      curlPinky: 1,
      thumbIndexTouch: 1,
      upright: 1,
    },
    emphasis: { thumbIndexTouch: 1.6, curlMiddle: 1.2 },
  },
  {
    letter: "G",
    targets: {
      curlIndex: 1,
      curlMiddle: 0.15,
      curlRing: 0.1,
      curlPinky: 0.1,
      thumbExt: 0.7,
      upright: 0,
    },
    emphasis: { upright: 1.6, curlIndex: 1.3 },
  },
  {
    letter: "H",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 0.1,
      curlPinky: 0.1,
      indexMiddleTouch: 0.8,
      upright: 0,
    },
    emphasis: { upright: 1.6, curlMiddle: 1.3 },
  },
  {
    letter: "I",
    targets: {
      curlIndex: 0.1,
      curlMiddle: 0.1,
      curlRing: 0.1,
      curlPinky: 1,
      thumbExt: 0.2,
      upright: 1,
    },
    emphasis: { curlPinky: 1.6, thumbExt: 1.2 },
  },
  {
    letter: "K",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 0.1,
      curlPinky: 0.1,
      indexMiddleSpread: 0.7,
      thumbMiddleTouch: 0.75,
      upright: 1,
    },
    emphasis: { thumbMiddleTouch: 1.5 },
  },
  {
    letter: "L",
    targets: {
      curlIndex: 1,
      curlMiddle: 0.1,
      curlRing: 0.1,
      curlPinky: 0.1,
      thumbExt: 1,
      upright: 1,
    },
    emphasis: { thumbExt: 1.6, curlIndex: 1.3 },
  },
  {
    letter: "M",
    targets: {
      curlIndex: 0.25,
      curlMiddle: 0.25,
      curlRing: 0.25,
      curlPinky: 0.1,
      thumbExt: 0.3,
      thumbPinkyTouch: 0.5,
      upright: 1,
    },
  },
  {
    letter: "N",
    targets: {
      curlIndex: 0.25,
      curlMiddle: 0.25,
      curlRing: 0.1,
      curlPinky: 0.1,
      thumbExt: 0.35,
      thumbMiddleTouch: 0.5,
      upright: 1,
    },
  },
  {
    letter: "O",
    targets: {
      curlIndex: 0.45,
      curlMiddle: 0.45,
      curlRing: 0.45,
      curlPinky: 0.45,
      thumbIndexTouch: 0.95,
      thumbMiddleTouch: 0.8,
      upright: 1,
    },
    emphasis: { thumbIndexTouch: 1.5 },
  },
  {
    letter: "R",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 0.1,
      curlPinky: 0.1,
      indexMiddleTouch: 1,
      indexMiddleSpread: 0,
      upright: 1,
    },
    emphasis: { indexMiddleTouch: 1.6 },
  },
  {
    letter: "S",
    targets: { ...fist, thumbExt: 0.25, thumbIndexTouch: 0.55, upright: 1 },
    emphasis: { thumbExt: 1.4 },
  },
  {
    letter: "T",
    targets: {
      curlIndex: 0.2,
      curlMiddle: 0.15,
      curlRing: 0.1,
      curlPinky: 0.1,
      thumbExt: 0.4,
      thumbIndexTouch: 0.75,
      upright: 1,
    },
  },
  {
    letter: "U",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 0.1,
      curlPinky: 0.1,
      indexMiddleTouch: 0.85,
      indexMiddleSpread: 0.1,
      thumbExt: 0.2,
      upright: 1,
    },
    emphasis: { indexMiddleSpread: 1.4 },
  },
  {
    letter: "V",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 0.1,
      curlPinky: 0.1,
      indexMiddleSpread: 0.85,
      thumbExt: 0.2,
      upright: 1,
    },
    emphasis: { indexMiddleSpread: 1.5 },
  },
  {
    letter: "W",
    targets: {
      curlIndex: 1,
      curlMiddle: 1,
      curlRing: 1,
      curlPinky: 0.1,
      indexMiddleSpread: 0.6,
      middleRingSpread: 0.6,
      upright: 1,
    },
    emphasis: { curlRing: 1.4, middleRingSpread: 1.3 },
  },
  {
    letter: "X",
    targets: {
      curlIndex: 0.45,
      curlMiddle: 0.1,
      curlRing: 0.1,
      curlPinky: 0.1,
      thumbExt: 0.25,
      upright: 1,
    },
    emphasis: { curlIndex: 1.6 },
  },
  {
    letter: "Y",
    targets: {
      curlIndex: 0.1,
      curlMiddle: 0.1,
      curlRing: 0.1,
      curlPinky: 1,
      thumbExt: 1,
      upright: 1,
    },
    emphasis: { thumbExt: 1.5, curlPinky: 1.4 },
  },
];

/** Letters that tend to be reliable with this geometric approach. */
export const RELIABLE_LETTERS = new Set([
  "B", "C", "F", "I", "L", "O", "V", "W", "Y",
]);
