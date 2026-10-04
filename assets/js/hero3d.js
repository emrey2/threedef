// Hero scene: a small studio still life rendered live with three.js.
// Falls back to the static image already in the markup if WebGL is unavailable.
import * as THREE from "../vendor/three/three.module.min.js";
import { RoomEnvironment } from "../vendor/three/RoomEnvironment.js";

const stage = document.querySelector("[data-stage]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

if (stage && supportsWebGL()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.4, 9);
  camera.lookAt(0, 0.2, 0);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  scene.add(key);

  const accentHex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c94a26";

  const clay = new THREE.MeshPhysicalMaterial({ roughness: 0.42, metalness: 0.0, clearcoat: 0.3, clearcoatRoughness: 0.4 });
  const accent = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(accentHex), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.12, metalness: 1 });

  const group = new THREE.Group();
  scene.add(group);

  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.36, 320, 48, 2, 3), clay);
  knot.castShadow = true;
  knot.position.y = 0.4;
  group.add(knot);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 64), accent);
  sphere.castShadow = true;
  group.add(sphere);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 32, 96), chrome);
  ring.castShadow = true;
  ring.position.set(-1.9, -0.95, 0.9);
  ring.rotation.set(Math.PI / 2.3, 0, 0.3);
  group.add(ring);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.4;
  floor.receiveShadow = true;
  scene.add(floor);

  const applyScheme = () => {
    const dark = darkScheme.matches;
    clay.color.set(dark ? 0x3a3a3f : 0xece9e3);
    chrome.color.set(dark ? 0xbbbbbb : 0xdddddd);
    floor.material.opacity = dark ? 0.45 : 0.18;
    renderer.toneMappingExposure = dark ? 1.15 : 1.0;
    accent.color.set(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || accentHex);
  };
  applyScheme();
  darkScheme.addEventListener("change", () => { applyScheme(); renderOnce(); });

  // Size to the stage element
  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1 ? 11.5 : 10;
    camera.updateProjectionMatrix();
    renderOnce();
  };
  new ResizeObserver(resize).observe(stage);

  // Pointer parallax, eased toward the target each frame
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  stage.addEventListener("pointerleave", () => { target.x = 0; target.y = 0; });

  const clock = new THREE.Clock();
  let running = false;
  let rafId = 0;
  let elapsed = 1.2;

  const pose = (t) => {
    knot.rotation.set(t * 0.18, t * 0.26, 0);
    sphere.position.set(Math.cos(t * 0.5) * 2.1, -0.6 + Math.sin(t * 1.1) * 0.12, Math.sin(t * 0.5) * 1.2);
    ring.rotation.z = 0.3 + t * 0.4;
  };

  function renderOnce() {
    renderer.render(scene, camera);
  }

  function frame() {
    elapsed += Math.min(clock.getDelta(), 0.05);
    const t = elapsed;
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
    group.rotation.y = current.x * 0.35;
    group.rotation.x = current.y * 0.12;
    pose(t);
    renderOnce();
    rafId = requestAnimationFrame(frame);
  }

  const start = () => {
    if (running || reduceMotion.matches) return;
    running = true;
    clock.getDelta();
    rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  // Only animate while visible; with reduced motion, show one still frame
  pose(elapsed);
  resize();
  stage.classList.add("is-live");

  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) { stop(); renderOnce(); } else { start(); }
  });
}
