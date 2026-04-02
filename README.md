# threejs_practice_docs

Vite + Three.js (ES modules): demo artwork / cube / sun + trang học **Raycaster** (`raycast.html`).

## Chạy local

```bash
npm install
npm run dev
```

- Trang chính: `/` — vòng tranh + cube + mặt trời  
- Raycast: `/raycast.html` — 100 cube + `Raycaster` + comment chi tiết trong `raycast.js`

## Ảnh artwork

Đặt các file trong thư mục `public/` (cùng tên như trong `objects/artwork.js`):

- `socrates.jpg`, `stars.jpg`, `wave.jpg`, `spring.jpg`, `mountain.jpg`, `sunday.jpg`

## Cấu trúc

- `main.js` — scene, camera, renderer, animation loop
- `objects/artwork.js` — vòng tranh texture
- `objects/sun.js` — mặt trời + point light
- `objects/cube.js` — cube xanh
