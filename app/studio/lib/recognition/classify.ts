import type { NormalizedLandmark } from "./handLandmarker";
import { extractFeatures } from "./features";
import { ALPHABET, FeatureKey, flatten } from "./alphabet";

export interface Classification {
  letter: string;
  /** 0..1 — higher is more confident. */
  confidence: number;
  /** Margin over the runner-up, 0..1. */
  margin: number;
}

const DEFAULT_WEIGHT = 1;

/**
 * Scores one hand's landmarks against every letter template and returns
 * the best match, or null when nothing is close enough to trust.
 */
export function classifyHand(
  landmarks: NormalizedLandmark[],
): Classification | null {
  const features = extractFeatures(landmarks);
  if (!features) return null;
  const flat = flatten(features);

  let best: { letter: string; score: number } | null = null;
  let second: number = Infinity;

  for (const template of ALPHABET) {
    let weighted = 0;
    let weightSum = 0;
    for (const key of Object.keys(template.targets) as FeatureKey[]) {
      const target = template.targets[key];
      if (target === undefined) continue;
      const weight = DEFAULT_WEIGHT * (template.emphasis?.[key] ?? 1);
      const diff = flat[key] - target;
      weighted += weight * diff * diff;
      weightSum += weight;
    }
    if (weightSum === 0) continue;
    const score = Math.sqrt(weighted / weightSum); // 0 = perfect match

    if (!best || score < best.score) {
      if (best) second = best.score;
      best = { letter: template.letter, score };
    } else if (score < second) {
      second = score;
    }
  }

  if (!best) return null;

  // score 0 → confidence 1; score ≥ 0.45 → 0.
  const confidence = Math.max(0, 1 - best.score / 0.45);
  const margin =
    second === Infinity ? 1 : Math.max(0, (second - best.score) / 0.45);

  if (confidence < 0.35) return null;

  return { letter: best.letter, confidence, margin };
}
