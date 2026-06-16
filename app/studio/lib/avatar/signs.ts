/**
 * Authored whole-word sign clips for the Holo avatar (right-handed,
 * one-hand approximations of ASL citation forms).
 *
 * HONESTY NOTE: these are simplified prototype animations — legible
 * gestures synchronized with captions, not certified ASL. Two-handed
 * signs are intentionally out of scope; unknown words are fingerspelled.
 *
 * Pose values are Euler XYZ rotations (radians) on normalized VRM bones.
 * `shape` references a fingerspelling handshape used for the hand itself.
 */

export interface SignFrame {
  /** Normalized time 0..1 within the clip. */
  at: number;
  pose: Record<string, [number, number, number]>;
  /** Handshape letter (from HANDSHAPES) to hold at this frame. */
  shape?: string;
}

export interface SignClip {
  duration: number; // seconds
  frames: SignFrame[];
}

// Reusable arm positions (right arm). The rightHand x ≈ 1.4 twist keeps
// the palm facing the viewer (tuned visually — see SPELL_ARM in animator).
const AT_TEMPLE: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.75, -0.55, -0.85],
  rightLowerArm: [0, -2.35, 0.6],
  rightHand: [1.4, -0.1, 0],
};

const AT_CHIN: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.6, -0.45, -0.95],
  rightLowerArm: [0, -2.2, 0.6],
  rightHand: [1.4, -0.1, 0],
};

const AT_CHEST: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.35, -0.3, -1.1],
  rightLowerArm: [0, -1.9, 0.5],
  rightHand: [1.2, -0.1, 0],
};

const EXTENDED: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.7, -0.8, -0.55],
  rightLowerArm: [0, -0.9, 0.3],
  rightHand: [1.1, -0.1, 0],
};

const RAISED: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.4, -0.25, -1.05],
  rightLowerArm: [0, -2.0, 0.6],
  rightHand: [1.4, -0.1, 0],
};

function wristTilt(
  base: Record<string, [number, number, number]>,
  x: number,
): Record<string, [number, number, number]> {
  const hand = base["rightHand"] ?? [0, 0, 0];
  return { ...base, rightHand: [hand[0] + x, hand[1], hand[2]] };
}

export const SIGNS: Record<string, SignClip> = {
  // Flat hand at temple arcs outward.
  HELLO: {
    duration: 1.3,
    frames: [
      { at: 0, pose: AT_TEMPLE, shape: "B" },
      { at: 0.35, pose: AT_TEMPLE, shape: "B" },
      { at: 1, pose: EXTENDED, shape: "B" },
    ],
  },
  // Flat hand from chin forward/down.
  THANK: {
    duration: 1.2,
    frames: [
      { at: 0, pose: AT_CHIN, shape: "B" },
      { at: 0.35, pose: AT_CHIN, shape: "B" },
      { at: 1, pose: EXTENDED, shape: "B" },
    ],
  },
  // Fist bobbing at the wrist (like a head nodding).
  YES: {
    duration: 1.3,
    frames: [
      { at: 0, pose: RAISED, shape: "S" },
      { at: 0.25, pose: wristTilt(RAISED, 0.55), shape: "S" },
      { at: 0.5, pose: RAISED, shape: "S" },
      { at: 0.75, pose: wristTilt(RAISED, 0.55), shape: "S" },
      { at: 1, pose: RAISED, shape: "S" },
    ],
  },
  // First two fingers close onto thumb, twice.
  NO: {
    duration: 1.2,
    frames: [
      { at: 0, pose: RAISED, shape: "U" },
      { at: 0.3, pose: RAISED, shape: "O" },
      { at: 0.55, pose: RAISED, shape: "U" },
      { at: 0.85, pose: RAISED, shape: "O" },
      { at: 1, pose: RAISED, shape: "U" },
    ],
  },
  // Flat hand from chin down to meet (approximation, one-handed).
  GOOD: {
    duration: 1.2,
    frames: [
      { at: 0, pose: AT_CHIN, shape: "B" },
      { at: 0.4, pose: AT_CHIN, shape: "B" },
      { at: 1, pose: AT_CHEST, shape: "B" },
    ],
  },
  // Flat hand circles on the chest.
  PLEASE: {
    duration: 1.5,
    frames: [
      { at: 0, pose: AT_CHEST, shape: "B" },
      { at: 0.25, pose: wristTilt(AT_CHEST, 0.2), shape: "B" },
      { at: 0.5, pose: AT_CHEST, shape: "B" },
      { at: 0.75, pose: wristTilt(AT_CHEST, -0.2), shape: "B" },
      { at: 1, pose: AT_CHEST, shape: "B" },
    ],
  },
  // Fist circles on the chest.
  SORRY: {
    duration: 1.5,
    frames: [
      { at: 0, pose: AT_CHEST, shape: "A" },
      { at: 0.25, pose: wristTilt(AT_CHEST, 0.2), shape: "A" },
      { at: 0.5, pose: AT_CHEST, shape: "A" },
      { at: 0.75, pose: wristTilt(AT_CHEST, -0.2), shape: "A" },
      { at: 1, pose: AT_CHEST, shape: "A" },
    ],
  },
  // Index points to own chest.
  ME: {
    duration: 0.9,
    frames: [
      { at: 0, pose: RAISED, shape: "D" },
      { at: 1, pose: wristTilt(AT_CHEST, 0.5), shape: "D" },
    ],
  },
  // Index points at the viewer.
  YOU: {
    duration: 0.9,
    frames: [
      { at: 0, pose: RAISED, shape: "D" },
      { at: 1, pose: EXTENDED, shape: "D" },
    ],
  },
  // Flat hand sweeps inward (welcome).
  WELCOME: {
    duration: 1.3,
    frames: [
      { at: 0, pose: EXTENDED, shape: "B" },
      { at: 1, pose: AT_CHEST, shape: "B" },
    ],
  },
};

// Common variants map to the same clips.
SIGNS["HI"] = SIGNS["HELLO"]!;
SIGNS["THANKS"] = SIGNS["THANK"]!;
SIGNS["I"] = SIGNS["ME"]!;
