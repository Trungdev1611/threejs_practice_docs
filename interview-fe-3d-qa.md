# Interview Q&A - React + Three.js + BIM/CIM (FE)

## 1) Bạn tổ chức kiến trúc React project như thế nào để scale?
Em tách theo feature + layer: `pages`, `components`, `stores`, `services`, `utils`.  
UI component chỉ hiển thị và gọi action; logic nghiệp vụ nằm ở service/store.  
Với dự án 3D, em tách thêm `viewer/` để gom toàn bộ camera, selection, scene controller.  
Mục tiêu là khi thêm feature mới thì ít ảnh hưởng module cũ và dễ test.

## 2) Khi nào dùng Context, khi nào dùng Zustand/Redux?
Context hợp cho state nhỏ, ít cập nhật như theme, auth user basic.  
State cập nhật thường xuyên hoặc nhiều màn hình dùng chung thì em ưu tiên Zustand/Redux để tách selector và tránh re-render lan.  
Dự án 3D em hay dùng Zustand vì gọn và đủ mạnh cho selectedIds, isolateIds, filter state.

## 3) Cách tối ưu re-render trong dashboard nhiều widget?
Em chia widget thành component độc lập, memo hóa (`React.memo`), dùng selector nhỏ để chỉ re-render phần cần.  
Dữ liệu nặng thì em chuẩn hóa và cache theo key.  
Event nhập liệu/filter em debounce để tránh spam render và API.

## 4) Bạn xử lý form phức tạp + validation async ra sao?
Em tách schema validation và submit logic riêng.  
Validation đồng bộ xử lý ngay trên client; validation async như check duplicate thì debounce và hiển thị trạng thái rõ.  
Lúc submit em khóa nút, có loading/error state, và map lỗi backend về field tương ứng.

## 5) Cách bạn quản lý lỗi API, retry, loading, empty state?
Em chuẩn hóa response/error shape trong `api client`, có interceptor để log và xử lý lỗi chung.  
UI luôn có 4 trạng thái: loading, success, empty, error.  
Các lỗi tạm thời (timeout, 5xx) thì retry có giới hạn; lỗi nghiệp vụ thì hiển thị message rõ để người dùng xử lý.

## 6) Kinh nghiệm debug race condition trong React hooks?
Em gặp khi user đổi filter nhanh làm response cũ ghi đè response mới.  
Cách xử lý: dùng `AbortController` hoặc request id để chỉ nhận kết quả mới nhất.  
Ngoài ra em kiểm tra dependency array kỹ để tránh effect chạy ngoài ý muốn.

## 7) Khác nhau giữa Three.js thuần và React Three Fiber?
Three.js thuần cho quyền kiểm soát thấp tầng tốt, phù hợp custom engine logic.  
R3F giúp viết scene theo tư duy React component, dễ compose và maintain với app React lớn.  
Khi cần integration UI-state-router mạnh, em ưu tiên R3F; khi cần low-level rendering đặc thù, em xuống Three.js thuần.

## 8) Vì sao scene bị giật? Bạn đo và tối ưu theo thứ tự nào?
Em đo theo thứ tự: FPS -> draw calls -> triangles -> texture memory -> React re-render.  
Sau đó tối ưu từ rẻ đến đắt: giảm pixel ratio, debounce input, tránh setState mỗi frame, gộp mesh/instancing, tối ưu texture.  
Luôn đo trước/sau để chứng minh hiệu quả chứ không tối ưu cảm tính.

## 9) draw calls là gì, giảm bằng cách nào?
Draw call là một lệnh gửi từ CPU sang GPU để render một đối tượng/material cụ thể.  
Quá nhiều draw call sẽ nghẽn CPU.  
Giảm bằng cách dùng `InstancedMesh`, gộp geometry, giảm số material, và hạn chế object riêng lẻ không cần thiết.

## 10) Khi nào dùng InstancedMesh?
Khi có nhiều object giống nhau về geometry/material, chỉ khác transform hoặc màu cơ bản.  
Ví dụ cột, bolt, marker lặp lại hàng trăm/hàng nghìn cái.  
Instancing giảm draw calls rất rõ, đổi lại việc thao tác từng instance sẽ phức tạp hơn mesh thường.

## 11) Cách xử lý resize, pixel ratio, camera aspect đúng?
Khi resize em cập nhật `camera.aspect`, gọi `camera.updateProjectionMatrix()`, rồi `renderer.setSize()`.  
Pixel ratio em thường cap ở 1.5 hoặc 2 tùy target máy để cân bằng nét và hiệu năng.  
Nếu app có canvas embedded thì em lấy kích thước container thay vì `window`.

## 12) Bạn xử lý memory leak trong Three.js thế nào?
Khi unmount scene/page, em dispose `geometry`, `material`, `texture`, remove event listeners và stop animation loop.  
Nếu load model nhiều lần, em quản lý lifecycle rõ theo model id để không giữ reference cũ.  
Em cũng dùng profiler/devtools để kiểm tra memory tăng dần bất thường.

## 13) Cách implement select/highlight/isolate object trong model?
Select bằng raycast hoặc API selection của viewer.  
Khi chọn, em cập nhật store `selectedIds`, đổi material/outline để highlight.  
Isolate là tập visibleIds; em ẩn phần còn lại bằng visibility flag, và có nút reset để quay về trạng thái ban đầu.

## 14) Metadata panel đồng bộ với selection trong 3D ra sao?
Selection chỉ ghi vào một source of truth trong store.  
Panel subscribe store và query metadata theo selected id.  
Chiều ngược lại, click trong panel cũng dispatch action chọn object trong viewer để đồng bộ hai chiều.

## 15) Mô hình lớn lag khi filter/search, bạn xử lý UX thế nào?
Em tách lọc thành 2 lớp: filter metadata trước, apply lên scene sau.  
Search có debounce, kết quả nhiều thì paginate/virtualize panel.  
Khi apply vào scene, em batch update và hiển thị trạng thái đang xử lý để user không nghĩ app bị treo.

## 16) Nếu toạ độ quá lớn gây jitter/z-fighting thì làm gì?
Em chuẩn hóa model về local origin gần camera, tránh dùng world coordinate quá lớn trực tiếp.  
Điều chỉnh near/far plane hợp lý để giảm mất chính xác độ sâu.  
Với z-fighting em xem lại scale, depth settings, và offset nếu cần.

## 17) Bạn thiết kế luồng model tree -> click -> focus camera thế nào?
Click node tree -> lấy object id -> chọn object -> tính bounding box -> camera fit-to-object.  
Cập nhật selected state vào store để panel và scene cùng đổi.  
Nếu object không tồn tại hoặc chưa load xong, em báo trạng thái rõ thay vì fail im lặng.

## 18) Luồng upload -> URN -> translate -> poll -> view bạn triển khai thế nào?
Frontend upload file lên API, API trả object info + URN.  
Tiếp theo FE gọi endpoint translate cho URN đó, rồi poll trạng thái manifest theo interval/backoff.  
Khi status thành công thì mở viewer bằng URN; thất bại thì hiển thị lỗi cụ thể và cho retry.

## 19) Token APS hết hạn khi đang xem model thì xử lý sao?
Em dùng callback lấy token động từ backend, không hardcode token ở client.  
Khi token lỗi, viewer/API trigger flow lấy token mới và retry có giới hạn.  
Nếu vẫn lỗi thì chuyển sang trạng thái error có hướng dẫn để user thao tác lại.

## 20) Bạn phân biệt lỗi do FE, backend hay APS service bằng cách nào?
Em gắn request id và log có ngữ cảnh ở cả FE và backend.  
Nếu FE fail trước khi gọi API là bug FE; nếu API trả lỗi có body rõ thì backend/business; nếu backend pass-through lỗi upstream APS thì phân loại external dependency.  
Mục tiêu là trong vài phút xác định được lớp nào gây lỗi.

## 21) Viewer load fail (404 assets / document load error) thì debug từ đâu?
Em check network tab trước: CSS/JS viewer có tải đúng version không.  
Sau đó check document id có đúng format URN và token scope đủ chưa.  
Cuối cùng kiểm tra endpoint status/manifest để biết model đã translate thành công hay chưa.

## 22) Bạn đảm bảo không lộ ClientSecret trên frontend ra sao?
ClientSecret chỉ nằm backend/env secret store, FE chỉ gọi API lấy token ngắn hạn.  
Không commit file config chứa secret vào git; dùng `.env.example` cho template.  
Nếu lộ thì rotate ngay và audit lại lịch sử commit.

## 23) Bạn thiết kế contract API cho FE để tránh breaking change thế nào?
Em thống nhất schema response ổn định: `data`, `error`, `meta` hoặc một convention cố định.  
Field mới thêm theo kiểu backward-compatible, tránh đổi nghĩa field cũ.  
Khi buộc phải đổi lớn, em version endpoint hoặc có migration window.

## 24) CORS, auth, error shape chuẩn cho frontend bạn đang dùng là gì?
CORS chỉ whitelist origin cần thiết, không mở wildcard bừa.  
Auth FE dùng bearer token/cookie theo hệ thống; API trả error shape đồng nhất để FE parse dễ.  
Mọi lỗi quan trọng đều có mã lỗi và message đủ rõ cho UI.

## 25) Cách poll trạng thái translate mà không spam server?
Em dùng interval có backoff (ví dụ 2s -> 4s -> 8s) và dừng khi done/failed/timeout.  
Khi tab ẩn em giảm tần suất poll hoặc pause nếu phù hợp.  
Có nút refresh thủ công để user chủ động khi cần.

## 26) Bạn log correlation ID từ FE -> BE ra sao để trace lỗi?
FE tạo hoặc nhận `x-correlation-id`, gửi kèm mỗi request.  
Backend log id này trong toàn bộ pipeline và include trong error response.  
Khi có lỗi từ user, chỉ cần correlation id là trace ngược được toàn hành trình.

## 27) Hãy kể một bug khó nhất bạn từng xử lý ở FE 3D.
Em từng gặp case scene giật dù mesh không nhiều.  
Nguyên nhân là state UI bị cập nhật trong loop mỗi frame, kéo theo re-render toàn bộ component liên quan.  
Em tách state frame-based sang ref và chỉ commit vào store khi có event người dùng, FPS cải thiện rõ.

## 28) Khi PM đổi yêu cầu gấp, bạn ưu tiên task thế nào?
Em chốt lại phạm vi tối thiểu tạo giá trị trước (MVP), liệt kê rủi ro và phần có thể defer.  
Task nào ảnh hưởng core flow user thì ưu tiên, phần cosmetic để sau.  
Em cập nhật thường xuyên để PM nắm trade-off thay vì nhận hết rồi trễ.

## 29) Bạn làm gì để đảm bảo code maintainable cho team?
Em thống nhất convention từ đầu: cấu trúc thư mục, naming, lint/format, pattern state.  
Logic khó em đóng thành module có interface rõ, tránh copy-paste.  
PR nhỏ, mô tả rõ lý do thay đổi để người sau hiểu nhanh.

## 30) Cách bạn review code và tránh regression?
Em review theo checklist: correctness -> performance -> readability -> edge cases.  
Với luồng quan trọng em có test scenario tối thiểu và manual test script trước merge.  
Sau merge em theo dõi lỗi runtime/log để bắt regression sớm.

## 31) Bạn học công nghệ mới (ví dụ APS, R3F) theo chiến lược nào?
Em học theo vòng lặp: làm mini proof-of-concept -> đọc doc chính thức -> áp vào feature thật -> viết note lại.  
Mỗi tuần em chọn 1 chủ đề sâu thay vì học dàn trải.  
Mục tiêu là biến kiến thức thành output đo được trong dự án.

---

## Gợi ý dùng tài liệu này khi phỏng vấn
- Mỗi câu tập nói trong 45-60 giây, theo khung: **bối cảnh -> cách làm -> kết quả**.
- Chuẩn bị 2-3 ví dụ thật từ project của bạn để chèn vào câu trả lời.
- Nếu chưa có số liệu, thêm metric cơ bản (FPS, thời gian load, số lỗi giảm) để tăng độ tin cậy.
