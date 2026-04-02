/**
 * raycast.js — Bài học Raycaster (Three.js)
 *
 * Mục tiêu:
 * - Hiểu tọa độ chuột chuẩn hóa (NDC) để bắn tia từ camera.
 * - Dùng Raycaster.intersectObjects để biết mesh nào bị trúng.
 * - Highlight object đang “pick” (ở đây dùng material.emissive như tutorial manual).
 *
 * Tài liệu tham khảo: three.js docs — Raycaster, PerspectiveCamera
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Random số thực trong [min, max].
 * Nếu chỉ truyền 1 tham số: rand(5) => [0, 5].
 */
function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

/**
 * Màu HSL ngẫu nhiên (chuỗi CSS) cho MeshPhongMaterial.color.
 * | 0 là ép số thực thành int (0–359 cho hue).
 */
function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

/**
 * PickHelper — gom logic “chọn object bằng tia” vào một class cho dễ đọc.
 *
 * Luồng mỗi frame (hoặc mỗi lần gọi pick):
 * 1) Nếu frame trước đã có pickedObject → khôi phục emissive cũ (tránh “dính” màu).
 * 2) Raycaster.setFromCamera(ndc, camera) — bắn tia từ camera qua điểm NDC trên mặt phẳng near.
 * 3) intersectObjects(...) — trả danh sách giao cắt, sắp xếp theo khoảng cách (gần nhất trước).
 * 4) Lấy phần tử [0], lưu emissive hiện tại, gán emissive nhấp nháy để thấy rõ đang pick cái nào.
 */
class PickHelper {
  constructor() {
    /** Tia + logic giao cắt; không cần new mỗi frame */
    this.raycaster = new THREE.Raycaster();
    /** Mesh đang được coi là “đang pick” (hoặc undefined) */
    this.pickedObject = null;
    /** Lưu màu emissive gốc để restore khi đổi sang object khác / bỏ pick */
    this.pickedObjectSavedColor = 0;
  }

  /**
   * @param normalizedPosition — Vector2 hoặc {x,y} trong NDC: x,y ∈ [-1, 1]
   * @param scene — scene gốc (sẽ duyệt scene.children)
   * @param camera — camera đang render
   * @param time — giây (dùng để nhấp nháy màu theo thời gian)
   */
  pick(normalizedPosition, scene, camera, time) {
    // Bước A: hoàn tác highlight object cũ (nếu có)
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // Bước B: đặt tia từ camera đi qua điểm (x,y) trên “màn hình ảo” NDC
    this.raycaster.setFromCamera(normalizedPosition, camera);

    // Bước C: quét giao cắt
    // Tham số thứ 2 = true: đệ quy vào con của Group (sau này bạn nhóm mesh vẫn pick được)
    const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);

    if (intersectedObjects.length) {
      // Phần tử đầu = điểm hit gần camera nhất
      const hit = intersectedObjects[0].object;
      // Chỉ xử lý Mesh có material (tránh helper / Line / Sprite lỡ trúng)
      if (!hit.isMesh || !hit.material) return;

      this.pickedObject = hit;
      this.pickedObjectSavedColor = hit.material.emissive.getHex();

      // Nhấp nháy đỏ/vàng theo time — chỉ để demo visual; production thường đổi outline hoặc 1 lần set màu
      hit.material.emissive.setHex((time * 8) % 2 > 1 ? 0xffff00 : 0xff0000);
    }
  }
}

/**
 * Chuyển tọa độ pixel chuột (event) sang Normalized Device Coordinates (NDC).
 *
 * NDC là hệ mà Three.js / OpenGL dùng cho “màn hình clip”:
 * - x: trái = -1, phải = +1
 * - y: dưới = -1, trên = +1  (nên phải đảo dấu Y so với clientY của trình duyệt)
 *
 * Quan trọng: dùng getBoundingClientRect() của canvas để đúng khi canvas không full màn hình
 * hoặc có thanh nav phía trên (offset so với window).
 */
function getCanvasNDC(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return { x, y };
}

function main() {
  // --- Renderer: vẽ WebGL lên canvas, gắn vào body (giống style main.js của bạn) ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // Giới hạn DPR để đỡ nặng GPU trên màn hình retina
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111118);

  // fov, aspect, near, far — frustum của PerspectiveCamera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500,
  );
  camera.position.set(0, 0, 45);

  // OrbitControls: xoay/pan/zoom bằng chuột — tiện khi học, không bắt buộc cho raycast
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // chuyển động mượt hơn một chút
  controls.target.set(0, 0, 0);

  // MeshPhongMaterial cần ánh sáng; Ambient + Directional là combo đơn giản
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  // Một geometry dùng chung cho 100 cube — tiết kiệm bộ nhớ (chỉ khác material / transform)
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const numObjects = 100;
  for (let i = 0; i < numObjects; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: randomColor(),
      // Bắt buộc khởi tạo emissive = đen để getHex() ổn định và restore đúng khi pick
      emissive: 0x000000,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
    cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
    cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
  }

  /**
   * pickPosition: Vector2 NDC cập nhật theo mousemove.
   * Giá trị (-10, -10) khi chuột ra khỏi canvas — nằm ngoài [-1,1] nên raycaster thường không hit gì
   * (cách đơn giản để “bỏ pick” mà không cần gọi pick riêng).
   */
  const pickPosition = new THREE.Vector2(-10, -10);
  const pickHelper = new PickHelper();

  renderer.domElement.addEventListener("mousemove", (e) => {
    const ndc = getCanvasNDC(e, renderer.domElement);
    pickPosition.set(ndc.x, ndc.y);
  });

  renderer.domElement.addEventListener("mouseleave", () => {
    pickPosition.set(-10, -10);
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

  function render(time) {
    // requestAnimationFrame trả milliseconds → đổi sang giây cho công thức nhấp nháy
    time *= 0.001;
    controls.update();
    pickHelper.pick(pickPosition, scene, camera, time);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
