import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";
import { HANDSHAPES, REST_SHAPE, Handshape } from "./handshapes";
import { SIGNS, SignClip } from "./signs";

export interface SignProgress {
  /** Word currently being signed (lowercased). */
  word: string;
  /** Letter currently shown when fingerspelling, null during whole-word signs. */
  letter: string | null;
  wordIndex: number;
  totalWords: number;
}

export interface SignHandlers {
  onProgress?: (progress: SignProgress) => void;
  onDone?: () => void;
}

type Step =
  | {
      kind: "letter";
      letter: string;
      shape: Handshape;
      duration: number;
      word: string;
      wordIndex: number;
    }
  | { kind: "sign"; clip: SignClip; word: string; wordIndex: number }
  | { kind: "gap"; duration: number }
  | { kind: "rest"; duration: number };

const LETTER_SECONDS = 0.85;
const GAP_SECONDS = 0.45;
const SMOOTH = 14; // exponential smoothing rate for bone rotations

/** Arm pose while fingerspelling: right hand raised beside the shoulder. */
const SPELL_ARM: Record<string, [number, number, number]> = {
  rightUpperArm: [-0.4, -0.25, -1.05],
  rightLowerArm: [0, -2.0, 0.4],
  rightHand: [0, -0.4, 0],
};

/** Relaxed arms-at-sides idle pose. */
const IDLE_POSE: Record<string, [number, number, number]> = {
  leftUpperArm: [0, 0, 1.2],
  rightUpperArm: [0, 0, -1.2],
  leftLowerArm: [0, 0, 0.1],
  rightLowerArm: [0, 0, -0.1],
  leftHand: [0, 0, 0],
  rightHand: [0, 0, 0],
};

/** Thumb presets → [metacarpal, proximal, distal] Euler XYZ rotations. */
const THUMB_POSES: Record<
  Handshape["thumb"],
  [[number, number, number], [number, number, number], [number, number, number]]
> = {
  rest: [
    [0.1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  across: [
    [0.5, -0.5, 0],
    [0, -0.45, 0],
    [0, -0.35, 0],
  ],
  side: [
    [0.25, -0.15, 0],
    [0, -0.1, 0],
    [0, -0.1, 0],
  ],
  out: [
    [-0.2, 0.45, 0],
    [0, 0.1, 0],
    [0, 0, 0],
  ],
  up: [
    [-0.45, 0.1, 0],
    [-0.2, 0, 0],
    [0, 0, 0],
  ],
  oppose: [
    [0.45, -0.3, 0],
    [0, -0.3, 0],
    [0, -0.25, 0],
  ],
};

const FINGER_BONES = [
  ["rightIndexProximal", "rightIndexIntermediate", "rightIndexDistal"],
  ["rightMiddleProximal", "rightMiddleIntermediate", "rightMiddleDistal"],
  ["rightRingProximal", "rightRingIntermediate", "rightRingDistal"],
  ["rightLittleProximal", "rightLittleIntermediate", "rightLittleDistal"],
] as const;

const THUMB_BONES = [
  "rightThumbMetacarpal",
  "rightThumbProximal",
  "rightThumbDistal",
] as const;

/**
 * Drives the VRM's normalized humanoid bones each frame: a breathing idle,
 * plus a queue of fingerspelled letters and whole-word sign clips. All
 * targets are smoothed, so transitions read as motion, not snaps.
 */
export class AvatarAnimator {
  private vrm: VRM;
  private queue: Step[] = [];
  private stepElapsed = 0;
  private handlers: SignHandlers | null = null;
  /** When false (reduced motion), decorative breathing/sway is disabled. */
  decorativeMotion = true;
  private targets = new Map<string, THREE.Quaternion>();
  private elapsed = 0;
  private readonly euler = new THREE.Euler();
  private readonly quat = new THREE.Quaternion();

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  get signing(): boolean {
    return this.queue.length > 0;
  }

  /** Queue a reply: known words play as sign clips, the rest fingerspell. */
  signText(text: string, handlers: SignHandlers): void {
    const words = text
      .toUpperCase()
      .replace(/[^A-Z' ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .slice(0, 24); // keep replies bounded

    const steps: Step[] = [];
    words.forEach((word, wordIndex) => {
      const clip = SIGNS[word];
      if (clip) {
        steps.push({ kind: "sign", clip, word, wordIndex });
      } else {
        for (const letter of word.replace(/'/g, "")) {
          const shape = HANDSHAPES[letter];
          if (!shape) continue;
          steps.push({
            kind: "letter",
            letter,
            shape,
            duration: LETTER_SECONDS,
            word,
            wordIndex,
          });
        }
      }
      steps.push({ kind: "gap", duration: GAP_SECONDS });
    });
    steps.push({ kind: "rest", duration: 0.6 });

    this.queue = steps;
    this.stepElapsed = 0;
    this.handlers = handlers;
    this.emitProgress(words.length);
  }

  cancel(): void {
    this.queue = [];
    this.handlers = null;
  }

  update(dt: number): void {
    this.elapsed += dt;
    this.advanceQueue(dt);
    this.computeTargets();
    this.applyTargets(dt);
  }

  // ------------------------------------------------------------------ queue

  private advanceQueue(dt: number): void {
    const step = this.queue[0];
    if (!step) return;
    this.stepElapsed += dt;
    const duration =
      step.kind === "sign" ? step.clip.duration : step.duration;
    if (this.stepElapsed >= duration) {
      this.queue.shift();
      this.stepElapsed = 0;
      const next = this.queue[0];
      if (!next) {
        const done = this.handlers?.onDone;
        this.handlers = null;
        done?.();
      } else {
        this.emitProgress();
      }
    }
  }

  private emitProgress(totalWords?: number): void {
    const step = this.queue[0];
    if (!step || step.kind === "gap" || step.kind === "rest") return;
    this.handlers?.onProgress?.({
      word: step.word.toLowerCase(),
      letter: step.kind === "letter" ? step.letter : null,
      wordIndex: step.wordIndex,
      totalWords: totalWords ?? 0,
    });
  }

  // ---------------------------------------------------------------- targets

  private setTarget(bone: string, x: number, y: number, z: number): void {
    this.euler.set(x, y, z);
    let q = this.targets.get(bone);
    if (!q) {
      q = new THREE.Quaternion();
      this.targets.set(bone, q);
    }
    q.setFromEuler(this.euler);
  }

  private computeTargets(): void {
    // Signing itself is content, never disabled; only the decorative
    // breathing/sway respects prefers-reduced-motion.
    const decorative = this.decorativeMotion ? 1 : 0;
    const breathe = Math.sin(this.elapsed * 1.4) * 0.018 * decorative;
    const sway = Math.sin(this.elapsed * 0.6) * 0.01 * decorative;
    this.setTarget("spine", breathe * 0.6, 0, 0);
    this.setTarget("chest", breathe, sway, 0);
    this.setTarget("head", breathe * -0.5, sway * 1.6, 0);

    const step = this.queue[0];

    if (!step || step.kind === "rest") {
      for (const [bone, [x, y, z]] of Object.entries(IDLE_POSE)) {
        this.setTarget(bone, x, y, z);
      }
      this.applyHandshape(REST_SHAPE);
      return;
    }

    if (step.kind === "sign") {
      this.applyClipPose(step.clip, this.stepElapsed);
      return;
    }

    // Fingerspelling (letters + inter-word gaps keep the hand raised).
    for (const [bone, [x, y, z]] of Object.entries(SPELL_ARM)) {
      this.setTarget(bone, x, y, z);
    }
    this.setTarget("leftUpperArm", 0, 0, 1.2);
    this.setTarget("leftLowerArm", 0, 0, 0.1);

    if (step.kind === "gap") {
      this.applyHandshape(REST_SHAPE);
      return;
    }

    const shape = step.shape;
    this.applyHandshape(shape);

    // Wrist orientation variants (G/H sideways, P/Q down).
    const handBase = SPELL_ARM["rightHand"] ?? [0, -0.4, 0];
    if (shape.wrist === "side") {
      this.setTarget("rightHand", handBase[0] + 0.0, handBase[1], handBase[2] - 1.2);
    } else if (shape.wrist === "down") {
      this.setTarget("rightHand", handBase[0] + 1.4, handBase[1], handBase[2]);
    }
  }

  private applyHandshape(shape: Handshape): void {
    shape.curls.forEach((curl, fingerIndex) => {
      const bones = FINGER_BONES[fingerIndex];
      if (!bones) return;
      const spread =
        shape.spread !== undefined && fingerIndex < 2
          ? (fingerIndex === 0 ? 1 : -1) * shape.spread
          : 0;
      this.setTarget(bones[0], 0, spread, -curl * 1.4);
      this.setTarget(bones[1], 0, 0, -curl * 1.5);
      this.setTarget(bones[2], 0, 0, -curl * 0.8);
    });

    const [meta, prox, dist] = THUMB_POSES[shape.thumb];
    this.setTarget(THUMB_BONES[0], meta[0], meta[1], meta[2]);
    this.setTarget(THUMB_BONES[1], prox[0], prox[1], prox[2]);
    this.setTarget(THUMB_BONES[2], dist[0], dist[1], dist[2]);
  }

  private applyClipPose(clip: SignClip, time: number): void {
    const t = Math.min(time / clip.duration, 1);
    // Find surrounding keyframes.
    let prev = clip.frames[0];
    let next = clip.frames[clip.frames.length - 1];
    for (let i = 0; i < clip.frames.length; i++) {
      const frame = clip.frames[i];
      if (!frame) continue;
      if (frame.at <= t) prev = frame;
      if (frame.at >= t) {
        next = frame;
        break;
      }
    }
    if (!prev || !next) return;
    const span = next.at - prev.at;
    const local = span > 0 ? (t - prev.at) / span : 0;

    const boneSet = new Set([
      ...Object.keys(prev.pose),
      ...Object.keys(next.pose),
    ]);
    for (const bone of boneSet) {
      const a = prev.pose[bone] ?? next.pose[bone];
      const b = next.pose[bone] ?? prev.pose[bone];
      if (!a || !b) continue;
      this.setTarget(
        bone,
        a[0] + (b[0] - a[0]) * local,
        a[1] + (b[1] - a[1]) * local,
        a[2] + (b[2] - a[2]) * local,
      );
    }

    const shape =
      (local < 0.5 ? prev.shape : next.shape) ?? prev.shape ?? next.shape;
    if (shape) {
      const hs = HANDSHAPES[shape] ?? REST_SHAPE;
      this.applyHandshape(hs);
    }
    this.setTarget("leftUpperArm", 0, 0, 1.2);
    this.setTarget("leftLowerArm", 0, 0, 0.1);
  }

  // ------------------------------------------------------------------ apply

  private applyTargets(dt: number): void {
    const alpha = 1 - Math.exp(-SMOOTH * dt);
    for (const [bone, target] of this.targets) {
      const node = this.vrm.humanoid?.getNormalizedBoneNode(
        bone as Parameters<
          NonNullable<VRM["humanoid"]>["getNormalizedBoneNode"]
        >[0],
      );
      if (!node) continue;
      node.quaternion.slerp(target, alpha);
    }
  }
}
