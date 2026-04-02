/**
 * raycast.js — Raycaster + metadata panel (demo gần UX BIM)
 *
 * - Mỗi cube có name + userData (metadata nghiệp vụ giả lập).
 * - Click chọn → highlight emissive + hiển thị panel bên phải (bbox, hit point, JSON userData).
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

/** Màu emissive khi được chọn (dễ nhìn, không nhấp nháy) */
const SELECT_EMISSIVE = 0x2a4a2a;

function getCanvasNDC(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return { x, y };
}

/**
 * Cập nhật DOM panel bên phải từ mesh + kết quả ray hit.
 */
function renderMetadataPanel(mesh, hit) {
  const emptyEl = document.getElementById("metadata-empty");
  const contentEl = document.getElementById("metadata-content");
  if (!emptyEl || !contentEl) return;

  if (!mesh || !hit) {
    emptyEl.hidden = false;
    contentEl.hidden = true;
    contentEl.innerHTML = "";
    return;
  }

  emptyEl.hidden = true;
  contentEl.hidden = false;

  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const ud = mesh.userData ?? {};
  const metaJson = JSON.stringify(ud, null, 2);

  const colorHex = mesh.material?.color?.getHexString?.() ?? "—";

  contentEl.innerHTML = `
    <dl>
      <dt>Tên (name)</dt>
      <dd>${escapeHtml(mesh.name || "(trống)")}</dd>
      <dt>UUID (Three.js)</dt>
      <dd><code>${escapeHtml(mesh.uuid)}</code></dd>
      <dt>Điểm hit (world)</dt>
      <dd>x ${hit.point.x.toFixed(2)}, y ${hit.point.y.toFixed(2)}, z ${hit.point.z.toFixed(2)}</dd>
      <dt>Khoảng cách camera → hit</dt>
      <dd>${hit.distance.toFixed(3)}</dd>
      <dt>Bbox size (đơn vị scene)</dt>
      <dd>W ${size.x.toFixed(2)} × H ${size.y.toFixed(2)} × D ${size.z.toFixed(2)}</dd>
      <dt>Bbox center (world)</dt>
      <dd>x ${center.x.toFixed(2)}, y ${center.y.toFixed(2)}, z ${center.z.toFixed(2)}</dd>
      <dt>Màu diffuse (hex)</dt>
      <dd>#${colorHex}</dd>
      <dt>userData (metadata nghiệp vụ)</dt>
    </dl>
    <pre class="meta-json">${escapeHtml(metaJson)}</pre>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111118);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );
  camera.position.set(0, 0, 45);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const categories = ["Wall", "Column", "Slab", "Beam", "Generic"];
  const numObjects = 100;

  for (let i = 0; i < numObjects; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: randomColor(),
      emissive: 0x000000,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = `DemoCube_${i}`;

    // Metadata giả lập — trên dự án thật thường map từ BIM / APS
    cube.userData = {
      elementId: `EL-${String(i).padStart(4, "0")}`,
      category: categories[i % categories.length],
      level: `L${(i % 8) + 1}`,
      discipline: i % 2 === 0 ? "Architecture" : "Structure",
      note: "Demo — thay bằng property từ viewer/API khi tích hợp APS",
    };

    scene.add(cube);
    cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
    cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
    cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
  }

  const raycaster = new THREE.Raycaster();
  let selectedMesh = null;
  let selectedEmissiveSaved = 0;

  function clearSelection() {
    if (selectedMesh?.material) {
      selectedMesh.material.emissive.setHex(selectedEmissiveSaved);
    }
    selectedMesh = null;
    renderMetadataPanel(null, null);
  }

  function selectMesh(mesh, hit) {
    if (selectedMesh === mesh) return;

    if (selectedMesh?.material) {
      selectedMesh.material.emissive.setHex(selectedEmissiveSaved);
    }

    if (!mesh?.isMesh || !mesh.material) {
      clearSelection();
      return;
    }

    selectedMesh = mesh;
    selectedEmissiveSaved = mesh.material.emissive.getHex();
    mesh.material.emissive.setHex(SELECT_EMISSIVE);
    renderMetadataPanel(mesh, hit);
  }

  renderer.domElement.addEventListener("click", (e) => {
    // Tránh xung đột: click UI panel không raycast
    if (e.target !== renderer.domElement) return;

    const ndc = getCanvasNDC(e, renderer.domElement);
    raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (!hits.length) {
      clearSelection();
      return;
    }

    const hit = hits[0];
    const obj = hit.object;
    if (!obj.isMesh || !obj.material) {
      clearSelection();
      return;
    }

    selectMesh(obj, hit);
  });

  function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onWindowResize, false);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
