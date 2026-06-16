import * as THREE from "three";
import type { VRM } from "@pixiv/three-vrm";

/**
 * Dresses the base VRoid body by repainting its single skin texture.
 *
 * The model ships with no clothing geometry — just one `Body_*_SKIN` mesh.
 * Rather than bolt on separate garment meshes (which would clip badly while
 * the avatar signs), we paint a fitted outfit directly onto a copy of the
 * body texture and swap it back in. Each texel is assigned to a garment by
 * the bone that drives it, so the clothing follows the skin perfectly through
 * every animation. Purely visual; geometry and skinning are untouched.
 */

type Cloth = "top" | "bottom" | "shoes";
type Garment = Cloth | "skin";

/** Map a skeleton bone name to the garment that should cover it. */
function garmentForBone(name: string): Garment {
  if (/UpperLeg|LowerLeg/.test(name)) return "bottom";
  if (/Foot|ToeBase/.test(name)) return "shoes";
  // Bust = VRoid secondary chest bones; they must read as torso, not skin.
  if (/Hips|Spine|Chest|Bust|Shoulder|UpperArm|LowerArm/.test(name)) return "top";
  return "skin"; // head, neck, hands, fingers, eyes
}

// Coverage priority when a triangle straddles regions — paint it with the
// highest-priority garment any of its vertices belong to. This closes the
// seams/holes between body parts so clothing edges read as hems, not gaps.
const PRIORITY: Cloth[] = ["top", "bottom", "shoes"];

// Brand palette (sRGB), tuned to read as sleek techwear against the render.
const FABRIC: Record<Cloth, { r: number; g: number; b: number }> = {
  top: { r: 32, g: 38, b: 60 }, // deep indigo hoodie
  bottom: { r: 17, g: 20, b: 31 }, // near-black trousers
  shoes: { r: 10, g: 12, b: 20 }, // black sneakers
};

function shade(
  c: { r: number; g: number; b: number },
  f: number,
): string {
  const k = Math.max(0, Math.min(1.15, f));
  return `rgb(${Math.round(c.r * k)},${Math.round(c.g * k)},${Math.round(c.b * k)})`;
}

/** Find the body skin mesh and its base-color texture. */
function findBody(vrm: VRM): {
  mesh: THREE.SkinnedMesh;
  material: THREE.Material & { map?: THREE.Texture | null };
} | null {
  let found: ReturnType<typeof findBody> = null;
  vrm.scene.traverse((obj) => {
    if (found || !(obj as THREE.SkinnedMesh).isSkinnedMesh) return;
    const mesh = obj as THREE.SkinnedMesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (/Body.*SKIN/i.test(m.name)) {
        found = {
          mesh,
          material: m as THREE.Material & { map?: THREE.Texture | null },
        };
        return;
      }
    }
  });
  return found;
}

export function applyOutfit(vrm: VRM): void {
  const body = findBody(vrm);
  if (!body) {
    console.warn("[outfit] body skin mesh not found — avatar left undressed");
    return;
  }
  const { mesh, material } = body;
  const tex = material.map;
  const src = tex?.image as
    | HTMLImageElement
    | ImageBitmap
    | HTMLCanvasElement
    | undefined;
  if (!tex || !src || !("width" in src) || !src.width) {
    console.warn("[outfit] skin texture not ready — avatar left undressed");
    return;
  }

  const geom = mesh.geometry;
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const uv = geom.attributes.uv as THREE.BufferAttribute;
  const nrm = geom.attributes.normal as THREE.BufferAttribute;
  const si = geom.attributes.skinIndex as THREE.BufferAttribute;
  const sw = geom.attributes.skinWeight as THREE.BufferAttribute;
  const index = geom.index;
  const bones = mesh.skeleton.bones;
  const vCount = pos.count;

  // Per-vertex garment from the dominant (highest-weight) bone.
  const vGarment = new Array<Garment>(vCount);
  for (let v = 0; v < vCount; v++) {
    let best = 0,
      bestW = -1;
    for (let c = 0; c < 4; c++) {
      const w = sw.getComponent(v, c);
      if (w > bestW) {
        bestW = w;
        best = si.getComponent(v, c);
      }
    }
    const bone = bones[best];
    vGarment[v] = bone ? garmentForBone(bone.name) : "skin";
  }

  // Height range (bind pose) for top-lit shading of the fabric.
  let yMin = Infinity,
    yMax = -Infinity;
  for (let v = 0; v < vCount; v++) {
    const y = pos.getY(v);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  const ySpan = Math.max(1e-4, yMax - yMin);

  // Paint at 2x the source for crisp garment edges, then the GPU samples it.
  const S = Math.min(2048, Math.max(1024, src.width * 2));
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src as CanvasImageSource, 0, 0, S, S);
  ctx.imageSmoothingEnabled = false;

  // Accumulator for the chest emblem anchor (front upper-chest texels).
  let cu = 0,
    cv = 0,
    cw = 0;

  const drawTri = (a: number, b: number, c: number) => {
    // Garment = highest-priority garment any of the three vertices belong to.
    const set = new Set([vGarment[a], vGarment[b], vGarment[c]]);
    const g = PRIORITY.find((p) => set.has(p));
    if (!g) return; // all three vertices are skin

    const ax = uv.getX(a) * S,
      ay = uv.getY(a) * S;
    const bx = uv.getX(b) * S,
      by = uv.getY(b) * S;
    const cx = uv.getX(c) * S,
      cy = uv.getY(c) * S;

    const hy =
      (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
    const h = (hy - yMin) / ySpan; // 0 at feet → 1 at head
    const front =
      (nrm.getZ(a) + nrm.getZ(b) + nrm.getZ(c)) / 3 > 0.15;

    const fabric = FABRIC[g];
    // Top-lit gradient + a touch more light on the front-facing panels.
    const f = (g === "top" ? 0.66 + 0.5 * h : 0.62 + 0.45 * h) * (front ? 1.05 : 0.9);
    ctx.fillStyle = shade(fabric, f);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();

    // Collect a chest anchor from front-facing upper-chest texels.
    if (g === "top" && front && h > 0.74 && h < 0.9) {
      const w = h;
      cu += ((ax + bx + cx) / 3) * w;
      cv += ((ay + by + cy) / 3) * w;
      cw += w;
    }
  };

  if (index) {
    for (let i = 0; i < index.count; i += 3)
      drawTri(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  } else {
    for (let i = 0; i < vCount; i += 3) drawTri(i, i + 1, i + 2);
  }

  // Brand details on the chest: a glowing zip placket + the two-bar mark.
  if (cw > 0) {
    const px = cu / cw;
    const py = cv / cw;
    const u = S / 1024; // unit scale relative to a 1024 reference

    ctx.save();
    ctx.translate(px, py);

    // Zip placket — a soft violet→cyan vertical strip down the center.
    const grad = ctx.createLinearGradient(0, -150 * u, 0, 150 * u);
    grad.addColorStop(0, "rgba(139,108,255,0.0)");
    grad.addColorStop(0.5, "rgba(124,92,255,0.55)");
    grad.addColorStop(1, "rgba(86,225,255,0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(-7 * u, -150 * u, 14 * u, 300 * u);

    // Two slanted bars (the HoloLabs mark) with a cyan glow.
    ctx.shadowColor = "rgba(86,225,255,0.9)";
    ctx.shadowBlur = 16 * u;
    ctx.fillStyle = "#7ce9ff";
    const bw = 13 * u,
      bh = 46 * u,
      gap = 9 * u,
      skew = 5 * u,
      oy = -10 * u;
    for (const sx of [-(bw + gap) / 2, (bw + gap) / 2]) {
      ctx.beginPath();
      ctx.moveTo(sx - bw / 2 + skew, oy - bh / 2);
      ctx.lineTo(sx + bw / 2 + skew, oy - bh / 2);
      ctx.lineTo(sx + bw / 2 - skew, oy + bh / 2);
      ctx.lineTo(sx - bw / 2 - skew, oy + bh / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Swap the painted canvas into the existing texture(s). Mutating in place
  // keeps the original flip / color-space / wrap settings exactly, so the
  // outfit lines up with the body's UVs the same way the skin map did.
  const swap = (t: THREE.Texture | null | undefined) => {
    if (!t) return;
    t.image = canvas;
    t.needsUpdate = true;
  };
  swap(tex);
  // MToon also samples a shade texture; point it at the outfit too so shadowed
  // areas of the clothing stay the fabric color instead of bare skin.
  const mt = material as unknown as {
    shadeMultiplyTexture?: THREE.Texture | null;
  };
  swap(mt.shadeMultiplyTexture);
  (material as THREE.Material).needsUpdate = true;
}
