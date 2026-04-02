import * as THREE from "three";

export function createCube(scene) {
  
  // Hiển thị cube - hình lập phương
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  // Nâng cube lên cao để không đè vào tâm
  cube.position.set(0, 2, 0);
  scene.add(cube);

  return { cube };
}
