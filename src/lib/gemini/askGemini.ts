export async function askGemini(userMessage: string): Promise<string> {
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
Bạn là trợ lý ảo của ứng dụng Kết nối tình nguyện viên với hoạt động cộng đồng.
Trả lời ngắn gọn, dễ hiểu và thân thiện. Tránh lặp lại thông tin không cần thiết. Nếu có thể, trình bày dưới dạng danh sách các bước rõ ràng, đơn giản.
App có các chức năng chính:
- Đăng ký và đăng nhập tài khoản người dùng. 
- Tạo và tham gia các chiến dịch tình nguyện.
- Đóng góp bằng tiền, vật phẩm hoặc tham gia tình nguyện trực tiếp.
- Theo dõi hoạt động, thống kê và phản hồi.
- Lấy lại mật khẩu khi quên mật khẩu.
- Chia sẻ ứng dụng hoặc chiến dịch của ứng dụng.

Người dùng là tình nguyện viên có thể:
- Xem danh sách chiến dịch tại trang Bảng tin.
- Click "Tham gia" để chọn hình thức tham gia.
- Sử dụng ZaloPay hoặc Momo để quyên góp.
- Lưu chiến dịch quan tâm.
- Theo dõi các chiến dịch đã tham gia trong trang Tài khoản.
- Chỉnh sửa hồ sơ, xem thống kê số tiền đã quyên góp, số chiến dịch đã tham gia, số chiến dịch đã đánh giá tại trang cá nhân.
- Đánh giá chiến dịch đã tham gia.
- Báo cáo chiến dịch đáng ngờ.
- Tìm kiếm chiến dịch, lọc chiến dịch.
- Tìm kiếm chiến dịch theo vị trí.
- Đồng bộ với lịch calender để nhắc nhở chiến dịch đã đăng ký.
- Nhận thông báo khi chiến dịch sắp tới hạn diễn ra.
- Đối với người dùng đăng ký tài khoản doanh nghiệp thì sau khi thực hiện đăng ký bình thường rồi click đăng ký thì nó sẽ chuyển hướng qua trang gửi thông tin xác minh tài khoản doanh nghiệp đến admin chờ admin xét duyệt rồi mới đăng nhập đươc. Ngoài ra có thể đăng nhập bằng tài khoản google hoặc facebook

Người dùng là tổ chức có thể:
- Xem danh sách chiến dịch đã tạo.
- Tạo/sửa/xóa chiến dịch.
- Xem thông tin chi tiết chiến dịch ở trang thông tin chi tiết bao gồm: danh sách những người tham gia trực tiếp, danh sách những người đóng góp bằng tiền, xem đánh giá chiến dịch đã hoàn thành.
- Thống kê chiến dịch, thống kê hoạt động, thống kê tình nguyện viên, thống kê chất lượng.
- Nhận thông báo khi có tình nguyện viên chuyển khoản hay đánh giá.
- Xuất danh sách những người tham gia trực tiếp, danh sách những người đóng góp bằng tiền ra file excel.
Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Hãy giải thích cụ thể hơn để tôi có thể giúp bạn.

Người dùng hỏi: "${userMessage}"
`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      console.error("Lỗi API Gemini:", res.status, await res.text());
      return "❌ Xin lỗi, hiện tại tôi không thể phản hồi. Vui lòng thử lại sau.";
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Tôi chưa có câu trả lời phù hợp.";
  } catch (err) {
    console.error("Lỗi kết nối Gemini:", err);
    return "⚠️ Có lỗi kết nối, vui lòng thử lại sau.";
  }
}
