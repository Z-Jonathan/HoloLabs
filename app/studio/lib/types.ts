/** Shared types for the Holo Studio feature. Self-contained — no imports
 *  from the marketing site beyond visual components. */

export type CameraStatus =
  | "idle" // not yet requested
  | "requesting" // permission prompt showing
  | "live" // streaming
  | "denied" // user refused permission
  | "unavailable" // no device / insecure context / API missing
  | "error"; // unexpected failure

export type RecognitionStatus =
  | "off" // camera not live yet
  | "loading" // model downloading / initializing
  | "ready" // running, no hand in frame
  | "tracking" // hand detected, classifying
  | "unsupported" // browser can't run the model
  | "error";

export type AvatarStatus = "loading" | "idle" | "signing" | "error";

export type MessageRole = "user" | "holo";

export type MessageSource = "sign" | "text" | "demo";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  source: MessageSource;
  createdAt: number;
}
