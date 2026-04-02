import * as THREE from "three";
import { createArtworkRing } from "./objects/artwork.js";
import { createSunSystem } from "./objects/sun.js";
import { createCube } from "./objects/cube.js";

// Khởi tạo scene / camera / renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const clock = new THREE.Clock();

// Đặt camera ra xa để nhìn thấy cả artwork + cube
camera.position.z = 15;

// Tạo các object từ module riêng (objects/)
const { rootNode } = createArtworkRing(scene);
const { cube } = createCube(scene);
const { objects } = createSunSystem(scene);

function animate() {
  const delta = clock.getDelta();

  // Quay vòng artwork
  rootNode.rotation.y += delta * 0.6;

  // Quay cube
  cube.rotation.x += delta * 0.5;
  cube.rotation.y += delta * 1.0;

  // Quay mặt trời (mesh trong hệ mặt trời)
  objects.forEach((obj) => {
    obj.rotation.y += delta * 0.2;
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height);
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize, false);
