## 1. Lý Thuyết
Để hiểu về Three.js một cách đơn giản nhất, bạn hãy tưởng tượng mình đang làm một đạo diễn sân khấu. Để có một vở kịch cho khán giả xem, bạn cần 4 thành phần cốt lõi sau:

1. Scene (Sân khấu)Đây là "vũ trụ" của bạn, là một không gian 3D trống rỗng nơi bạn đặt tất cả mọi thứ vào.Nhiệm vụ: Chứa các vật thể (nhà cửa, cái ghế), ánh sáng và camera.Lệnh code: const scene = new THREE.Scene();Tư duy lập trình: Nó giống như một cái Array hoặc một Root Object. Nếu bạn không add vật thể vào scene, vật thể đó sẽ không tồn tại trong thế giới của bạn.

2. Objects (Vật thể / Diễn viên)Trong Three.js, một vật thể cơ bản thường được gọi là Mesh. Để tạo ra một Mesh, bạn cần 2 thứ:Geometry (Khung xương): Định nghĩa hình dáng (Hình hộp, hình cầu, hay một mô hình BIM từ Revit).Material (Da thịt/Chất liệu): Định nghĩa vẻ bề ngoài (Màu đỏ, độ bóng, độ nhám, hay chất liệu bê tông, kính).Tư duy lập trình: Mesh = Geometry + Material.

3. Camera (Ống kính máy quay)Sân khấu có thể rất rộng, nhưng khán giả chỉ thấy những gì Camera quay được.Nhiệm vụ: Xác định góc nhìn và phạm vi nhìn thấy (như phần near, far, fov ta vừa nói).Vị trí: Mặc định khi tạo ra, cả Camera và Vật thể đều nằm ở tọa độ $(0, 0, 0)$. Vì vậy, bạn luôn phải di chuyển Camera lùi ra xa (ví dụ: camera.position.z = 5) thì mới thấy được vật thể.

4. Renderer (Máy chiếu / Trình kết xuất)Đây là "nhân viên kỹ thuật" quan trọng nhất.Nhiệm vụ: Lấy dữ liệu từ Scene thông qua góc nhìn của Camera và vẽ (render) nó lên cái thẻ <canvas> trên trình duyệt web của bạn.Tư duy lập trình: Nó biến các con số tọa độ 3D phức tạp thành các điểm ảnh (pixels) 2D trên màn hình.Lệnh code: renderer.render(scene, camera);

Tóm tắt quy trình hoạt động:Khởi tạo: Tạo ra cái Scene (Sân khấu).Chuẩn bị: Tạo Mesh (Diễn viên), đặt Camera (Máy quay) vào vị trí.Hành động (Render Loop): Bạn bảo Renderer vẽ lại cảnh đó liên tục (thường là 60 lần mỗi giây). Nếu bạn thay đổi vị trí vật thể trong mỗi lần vẽ, bạn sẽ có Animation (Chuyển động).Mẹo cho dân xây dựng/BIM:Khi bạn dùng Autodesk APS (Forge), Autodesk đã làm sẵn cho bạn cái Scene và Renderer rất khủng khiếp rồi. Việc của bạn chủ yếu là tương tác với các Objects (cấu kiện thép, tường) và điều khiển Camera để đi tham quan công trình.


## 2. Các phần nên học trước
Để nắm chắc cơ bản mà không bị "ngợp" giữa hàng trăm trang tài liệu của Three.js Manual, một Frontend Developer như bạn nên tập trung vào các chương cốt lõi sau đây.

Dưới đây là lộ trình "đọc có chọn lọc" trên trang [threejs.org/manual](https://threejs.org/manual/):

1. Phần "Basics" (Bắt buộc)
Đây là nền tảng để bạn hiểu cách Three.js vận hành bên dưới:

Fundamentals: Hiểu về Scene Graph (Cây phân cấp). Đây là linh hồn của Three.js.

Responsive Design: Chính là phần bạn vừa làm (xử lý resize). Đọc để hiểu tại sao cần updateProjectionMatrix.

Primitives: Danh sách các hình khối cơ bản. Bạn chỉ cần lướt qua để biết Three.js có sẵn Box, Sphere, Plane,... để khi cần thì lôi ra dùng.

2. Phần "Core Concepts" (Quan trọng cho BIM/APS)
Vì bạn làm về mô hình xây dựng, những phần này là "vũ khí" chính:

Scenegraph: Hiểu cách các vật thể cha - con tác động lẫn nhau (ví dụ: xoay cái nhà thì cái cửa xoay theo).

Materials: Đọc về MeshStandardMaterial và MeshPhongMaterial. Trong BIM, đây là những thứ giúp vật thể trông giống bê tông, thép hay kính.

Textures: Cách dán hình ảnh lên bề mặt (ví dụ: dán map vân gỗ lên sàn nhà).

Lights: Nắm vững AmbientLight (sáng đều) và DirectionalLight (ánh sáng mặt trời).

3. Phần "Input & Interaction" (Để làm App thực tế)
Để người dùng có thể tương tác với mô hình:

Cameras: Hiểu sự khác biệt giữa Perspective (nhìn xa hóa nhỏ - giống mắt người) và Orthographic (nhìn từ trên xuống không biến dạng - giống bản vẽ CAD).

Picking (Raycasting): Cực kỳ quan trọng. Đây là phần hướng dẫn cách click chuột vào một vật thể 3D để chọn nó. Nếu không có cái này, bạn không thể làm web BIM.

4. Phần "Loaders" (Để đưa file Revit/CAD vào)
Loading a .GLTF file: Đây là định dạng chuẩn nhất hiện nay. Mọi mô hình từ Revit/APS sau khi xử lý thường sẽ được xuất hoặc convert qua dạng này để hiển thị trên Web.

Những phần bạn CÓ THỂ BỎ QUA (Chưa cần lúc này):
Optimization: Khi nào app cực nặng hãy đọc.

Post Processing: Các hiệu ứng điện ảnh như làm mờ, lóa sáng... (không cần cho BIM cơ bản).

Shaders/GLSL: Đây là phần "khó nhằn" nhất, dành cho dân chuyên đồ họa sâu. Bạn chỉ cần dùng Material có sẵn là đủ.

WebGPU: Công nghệ mới, chưa cần thiết khi bạn mới bắt đầu.

Tóm tắt chiến thuật cho bạn:
Đọc Fundamentals để hiểu luồng.

Học kỹ Picking (để tương tác).

Học kỹ Loaders (để đưa data vào).