/**
 * Synthetic sanity check for the fingerspelling classifier.
 * Builds hands via simple forward kinematics (upright right hand,
 * normalized image coords, y-down) and checks the classifier picks the
 * intended letter for a set of distinctive handshapes.
 *
 * Run: npx tsx scripts/test-classifier.ts
 */
import { classifyHand } from "../app/studio/lib/recognition/classify";
import type { NormalizedLandmark } from "../app/studio/lib/recognition/handLandmarker";

type V2 = { x: number; y: number };

const WRIST: V2 = { x: 0.5, y: 0.88 };
const PALM_LEN = 0.26; // wrist → middle MCP

/** Joint segment lengths per finger (in image units). */
const SEG = {
  index: [0.075, 0.045, 0.035],
  middle: [0.085, 0.05, 0.04],
  ring: [0.078, 0.047, 0.037],
  pinky: [0.06, 0.037, 0.03],
} as const;

const MCP_X_OFFSET = { index: -0.07, middle: -0.022, ring: 0.026, pinky: 0.072 } as const;

function mk(x: number, y: number): NormalizedLandmark {
  return { x, y, z: 0, visibility: 1 };
}

/**
 * Builds one finger as a chain of 3 segments starting at the MCP.
 * `baseAngle` is radians from straight-up (0 = up, +ve = toward thumb side
 * mirrored x), `curl` bends each successive joint by the same amount.
 */
function finger(
  mcp: V2,
  segments: readonly [number, number, number],
  baseAngle: number,
  curlPerJoint: number,
): NormalizedLandmark[] {
  const pts: NormalizedLandmark[] = [];
  let angle = baseAngle;
  let cur = { ...mcp };
  for (const len of segments) {
    cur = {
      x: cur.x + Math.sin(angle) * len,
      y: cur.y - Math.cos(angle) * len,
    };
    pts.push(mk(cur.x, cur.y));
    angle += curlPerJoint;
  }
  return pts;
}

interface HandSpec {
  /** Curl per joint in radians for each finger; 0 = straight, ~1.5 = fist. */
  curls: { index: number; middle: number; ring: number; pinky: number };
  /** Splay angle (radians from vertical) per finger. */
  splay?: Partial<Record<"index" | "middle" | "ring" | "pinky", number>>;
  /** Thumb tip position (absolute). */
  thumbTip: V2;
}

function buildHand(spec: HandSpec): NormalizedLandmark[] {
  const lm: NormalizedLandmark[] = [];
  lm[0] = mk(WRIST.x, WRIST.y);

  // Thumb chain: CMC → MCP → IP → TIP, interpolated toward the tip.
  const thumbBase: V2 = { x: WRIST.x - 0.05, y: WRIST.y - 0.05 };
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    lm[1 + i] = mk(
      thumbBase.x + (spec.thumbTip.x - thumbBase.x) * t,
      thumbBase.y + (spec.thumbTip.y - thumbBase.y) * t,
    );
  }

  const fingers = ["index", "middle", "ring", "pinky"] as const;
  const mcpBase = [5, 9, 13, 17] as const;
  fingers.forEach((name, fi) => {
    const base = mcpBase[fi];
    if (base === undefined) return;
    const mcp: V2 = {
      x: WRIST.x + MCP_X_OFFSET[name],
      y: WRIST.y - PALM_LEN - (name === "middle" ? 0.012 : 0),
    };
    lm[base] = mk(mcp.x, mcp.y);
    const chain = finger(
      mcp,
      SEG[name],
      spec.splay?.[name] ?? 0,
      spec.curls[name],
    );
    const [pip, dip, tip] = chain;
    if (!pip || !dip || !tip) return;
    lm[base + 1] = pip;
    lm[base + 2] = dip;
    lm[base + 3] = tip;
  });

  return lm;
}

const STRAIGHT = 0.05;
const FIST = 1.25;

const cases: Array<{ expect: string; hand: NormalizedLandmark[] }> = [
  {
    // B: four fingers straight up, thumb folded across palm (near ring MCP).
    expect: "B",
    hand: buildHand({
      curls: { index: STRAIGHT, middle: STRAIGHT, ring: STRAIGHT, pinky: STRAIGHT },
      thumbTip: { x: 0.53, y: 0.64 },
    }),
  },
  {
    // V: index+middle straight and spread, ring+pinky curled, thumb tucked.
    expect: "V",
    hand: buildHand({
      curls: { index: STRAIGHT, middle: STRAIGHT, ring: FIST, pinky: FIST },
      splay: { index: -0.28, middle: 0.12 },
      thumbTip: { x: 0.54, y: 0.66 },
    }),
  },
  {
    // L: index up, thumb way out to the side, others curled.
    expect: "L",
    hand: buildHand({
      curls: { index: STRAIGHT, middle: FIST, ring: FIST, pinky: FIST },
      thumbTip: { x: 0.3, y: 0.62 },
    }),
  },
  {
    // Y: pinky up, thumb out, index/middle/ring curled.
    expect: "Y",
    hand: buildHand({
      curls: { index: FIST, middle: FIST, ring: FIST, pinky: STRAIGHT },
      thumbTip: { x: 0.3, y: 0.62 },
    }),
  },
  {
    // W: index+middle+ring up and spread, pinky curled.
    expect: "W",
    hand: buildHand({
      curls: { index: STRAIGHT, middle: STRAIGHT, ring: STRAIGHT, pinky: FIST },
      splay: { index: -0.25, ring: 0.25 },
      thumbTip: { x: 0.56, y: 0.68 },
    }),
  },
  {
    // I: only pinky up, thumb folded.
    expect: "I",
    hand: buildHand({
      curls: { index: FIST, middle: FIST, ring: FIST, pinky: STRAIGHT },
      thumbTip: { x: 0.52, y: 0.66 },
    }),
  },
];

let failures = 0;
for (const { expect, hand } of cases) {
  const result = classifyHand(hand);
  const got = result?.letter ?? "(none)";
  const ok = got === expect;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  expected ${expect}  got ${got}` +
      (result ? `  conf=${result.confidence.toFixed(2)} margin=${result.margin.toFixed(2)}` : ""),
  );
}

if (failures > 0) {
  console.error(`\n${failures}/${cases.length} cases failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} synthetic cases passed`);
