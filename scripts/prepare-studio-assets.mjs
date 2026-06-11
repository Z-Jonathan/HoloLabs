/**
 * Prepares Holo Studio's recognition assets (runs before dev/build):
 *  1. Copies MediaPipe WASM runtimes from node_modules → public/mediapipe-wasm
 *  2. Downloads the hand_landmarker model into public/models if missing
 * Both locations are gitignored — this keeps ~30 MB of binaries out of the
 * repo while remaining fully reproducible on Vercel.
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const wasmSrc = join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const wasmDest = join(root, "public", "mediapipe-wasm");

const modelDest = join(root, "public", "models", "hand_landmarker.task");
const modelUrl =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";

// CC0 VRoid sample model (madjin/vrm-samples) used as Holo's avatar.
const avatarDest = join(root, "public", "avatar", "holo.vrm");
const avatarUrl =
  "https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/masc_vroid.vrm";

if (!existsSync(wasmSrc)) {
  console.error(
    "[studio-assets] @mediapipe/tasks-vision not installed — run npm install first.",
  );
  process.exit(1);
}

cpSync(wasmSrc, wasmDest, { recursive: true });
console.log("[studio-assets] MediaPipe WASM copied to public/mediapipe-wasm");

async function download(dest, url, label) {
  if (existsSync(dest)) {
    console.log(`[studio-assets] ${label} already present`);
    return;
  }
  console.log(`[studio-assets] downloading ${label} …`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(
      `[studio-assets] ${label} download failed: ${res.status} ${res.statusText}`,
    );
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`[studio-assets] ${label} downloaded`);
}

await download(modelDest, modelUrl, "hand_landmarker.task");
await download(avatarDest, avatarUrl, "holo.vrm (CC0 avatar)");
