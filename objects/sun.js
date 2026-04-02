import * as THREE from "three";

export function createSunSystem(scene) {
  // Mảng object có thể dùng để cập nhật rotation sau này
  const objects = [];

  // Illustrate the sun: dùng sphere đơn giản
  const radius = 1;
  const widthSegments = 4;
  const heightSegments = 4;
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );
  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });

  // PointLight đóng vai trò nguồn sáng như mặt trời
  const light = new THREE.PointLight(0xffffff, 100);
  scene.add(light);

  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(2, 2, 2); // làm "mặt trời" to hơn
  scene.add(sunMesh);

  objects.push(sunMesh);
  return { objects };
}
