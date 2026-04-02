# Three.js demo — artwork ring + cube + sun

Vite + Three.js (ES modules). Code tách module trong `objects/`.

## Chạy local

```bash
npm install
npm run dev
```

Mở URL Vite in ra (thường `http://localhost:5173`).

## Ảnh artwork

Đặt các file trong thư mục `public/` (cùng tên như trong `objects/artwork.js`):

- `socrates.jpg`, `stars.jpg`, `wave.jpg`, `spring.jpg`, `mountain.jpg`, `sunday.jpg`

## Cấu trúc

- `main.js` — scene, camera, renderer, animation loop
- `objects/artwork.js` — vòng tranh texture
- `objects/sun.js` — mặt trời + point light
- `objects/cube.js` — cube xanh
