"use client";

import type {
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export type { HandLandmarkerResult, NormalizedLandmark };

let instance: HandLandmarker | null = null;
let loading: Promise<HandLandmarker> | null = null;

/**
 * Lazily creates the MediaPipe HandLandmarker (WASM + model are served
 * from our own /public — nothing third-party at runtime). The heavy
 * import happens only when the camera goes live.
 */
export function loadHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return Promise.resolve(instance);
  if (loading) return loading;

  loading = (async () => {
    const { FilesetResolver, HandLandmarker } = await import(
      "@mediapipe/tasks-vision"
    );
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe-wasm");
    const landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "/models/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    instance = landmarker;
    return landmarker;
  })().catch((err) => {
    // Allow a retry after a transient failure.
    loading = null;
    throw err;
  });

  return loading;
}
