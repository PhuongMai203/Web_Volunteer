import Swal from "sweetalert2";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export const handleReport = async (activityId: string) => {
  const { value: selectedReason } = await Swal.fire({
   title: "🚩 BÁO CÁO",
        html: `
        <div style="text-align: left; font-size: 14px; color: #333;">
            <p style="margin-bottom: 12px;">
            Nếu bạn nhận thấy nội dung có dấu hiệu <b style="color: #e74c3c;">nguy hiểm</b>, xin hãy báo cáo để chúng tôi xử lý kịp thời.
            </p>

            <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border: 1px solid #ffc107;">
            <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                <input type="radio" name="reason" value="Nội dung bạo lực / thù ghét / quấy rối" style="margin-right: 8px;">
                <span>Nội dung <b style="color: #e74c3c;">bạo lực</b>, thù ghét, quấy rối</span>
            </label>

            <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                <input type="radio" name="reason" value="Bán hàng, quảng cáo mặt hàng sai sự thật" style="margin-right: 8px;">
                <span>Bán hàng, quảng cáo <b style="color: #ff9800;">sai sự thật</b></span>
            </label>

            <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                <input type="radio" name="reason" value="Thông tin sai sự thật, lừa đảo, gian lận" style="margin-right: 8px;">
                <span>Thông tin <b style="color: #e74c3c;">sai sự thật</b>, lừa đảo, gian lận</span>
            </label>

            <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                <input type="radio" name="reason" value="Khác" id="r4" style="margin-right: 8px;">
                <span>Khác</span>
            </label>

            <input
                type="text"
                id="otherReasonInput"
                placeholder="Vui lòng nhập lý do cụ thể..."
                style="margin-top: 10px; display: none; width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
            />
            </div>
        </div>
        `,
    showCancelButton: true,
    confirmButtonText: "Gửi",
    cancelButtonText: "Hủy",
    preConfirm: () => {
      const checked = (
        document.querySelector<HTMLInputElement>('input[name="reason"]:checked')
      )?.value;

      if (!checked) {
        Swal.showValidationMessage("Vui lòng chọn lý do báo cáo!");
        return;
      }

      if (checked === "Khác") {
        const otherReason = (
          document.getElementById("otherReasonInput") as HTMLInputElement
        ).value.trim();
        if (!otherReason) {
          Swal.showValidationMessage("Vui lòng nhập lý do cụ thể!");
          return;
        }
        return otherReason;
      }

      return checked;
    },
    didOpen: () => {
      const radios = document.querySelectorAll('input[name="reason"]');
      radios.forEach((radio) =>
        radio.addEventListener("change", () => {
          const otherInput = document.getElementById("otherReasonInput") as HTMLInputElement;
          if ((radio as HTMLInputElement).value === "Khác" && (radio as HTMLInputElement).checked) {
            otherInput.style.display = "block";
          } else if (otherInput) {
            otherInput.style.display = "none";
          }
        })
      );
    },
  });

  if (selectedReason) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Swal.fire("Lỗi", "Vui lòng đăng nhập trước khi báo cáo!", "error");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
        activityId,
        userId: user.uid,
        reason: selectedReason,
        createdAt: serverTimestamp(),
      });
      Swal.fire("Thành công", "Báo cáo của bạn đã được gửi.", "success");
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      Swal.fire("Lỗi", "Không thể gửi báo cáo. Vui lòng thử lại.", "error");
    }
  }
};
