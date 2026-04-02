import * as THREE from "three";

export function createArtworkRing(scene) {
  // Danh sách ảnh để bọc thành 1 vòng quanh tâm
  const images = [
    "socrates.jpg",
    "stars.jpg",
    "wave.jpg",
    "spring.jpg",
    "mountain.jpg",
    "sunday.jpg",
  ];

  // Node gốc chứa toàn bộ artwork
  const rootNode = new THREE.Object3D();
  scene.add(rootNode);

  const textureLoader = new THREE.TextureLoader();
  const count = images.length;

  for (let i = 0; i < count; i++) {
    // Tải texture từ thư mục public (hoặc root static)
    const texture = textureLoader.load(images[i]);
    
    // Đảm bảo màu ảnh hiển thị đúng (sRGB)
    texture.colorSpace = THREE.SRGBColorSpace;

    // Mỗi ảnh có 1 node "đế" để quay theo góc đều nhau
    const baseNode = new THREE.Object3D();

    // 360 độ = 2*PI, chia đều cho số lượng ảnh
    baseNode.rotation.y = (i * Math.PI * 2) / count;
    rootNode.add(baseNode);

    // Hình hộp mỏng giả làm "khung tranh"
    const artwork = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 0.1),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    
    // Đẩy tranh ra xa tâm (bán kính vòng)
    artwork.position.z = -6;
    baseNode.add(artwork);
  }

  return { rootNode };
}
