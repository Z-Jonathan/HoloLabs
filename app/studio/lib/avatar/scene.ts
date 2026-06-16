import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { AvatarAnimator, SignHandlers, SPELL_ARM } from "./animator";
import { applyOutfit } from "./outfit";

export interface AvatarScene {
  /** Queue a reply for the avatar to sign. */
  signText: (text: string, handlers: SignHandlers) => void;
  cancel: () => void;
  dispose: () => void;
}

/**
 * Self-contained three.js scene: renders the VRM avatar into the given
 * canvas with brand-tinted lighting, runs the animator every frame, and
 * handles resize + cleanup. No React inside — the panel owns the React side.
 */
export async function createAvatarScene(
  canvas: HTMLCanvasElement,
): Promise<AvatarScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 1.42, 1.15);
  camera.lookAt(0, 1.36, 0);

  // Brand-tinted lighting: soft key + violet/cyan rims.
  scene.add(new THREE.AmbientLight(0xb8c4ff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(0.6, 1.8, 1.4);
  scene.add(key);
  const rimViolet = new THREE.DirectionalLight(0x8b6cff, 0.9);
  rimViolet.position.set(-1.4, 1.2, -0.8);
  scene.add(rimViolet);
  const rimCyan = new THREE.DirectionalLight(0x56e1ff, 0.7);
  rimCyan.position.set(1.4, 0.6, -0.9);
  scene.add(rimCyan);

  // Load the VRM.
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync("/avatar/holo.vrm");
  const vrm = gltf.userData.vrm as VRM;

  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  // VRM0 models face +Z; rotate so the avatar faces the camera.
  VRMUtils.rotateVRM0(vrm);

  // Paint a fitted outfit onto the base body texture (the model ships nude).
  applyOutfit(vrm);

  scene.add(vrm.scene);

  const animator = new AvatarAnimator(vrm);
  animator.decorativeMotion = !window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Pose-tuning hook: /studio?tune exposes the animator + the live pose
  // table so hand/arm values can be adjusted from the console.
  if (new URLSearchParams(window.location.search).has("tune")) {
    (window as unknown as { __holoAvatar?: unknown }).__holoAvatar = {
      animator,
      spellArm: SPELL_ARM,
    };
  }

  // Resize handling.
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(box.width));
    const h = Math.max(1, Math.round(box.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const clock = new THREE.Clock();
  let disposed = false;
  let rafId = 0;

  const loop = () => {
    if (disposed) return;
    const dt = Math.min(clock.getDelta(), 0.1);
    animator.update(dt);
    vrm.update(dt);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  return {
    signText: (text, handlers) => animator.signText(text, handlers),
    cancel: () => animator.cancel(),
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      VRMUtils.deepDispose(vrm.scene);
      renderer.dispose();
    },
  };
}
