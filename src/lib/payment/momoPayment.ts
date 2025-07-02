import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";

export const handleMomoPayment = async (
  campaignId: string,
  campaignTitle: string,
  
  amount: number,
  user: { uid: string; name: string }
) => {
  try {
    const campaignDocRef = doc(db, "featured_activities", campaignId);
    const campaignDocSnap = await getDoc(campaignDocRef);
    let emailCampaign = "";

    if (campaignDocSnap.exists()) {
      const campaignData = campaignDocSnap.data();
      emailCampaign = campaignData?.email || "";
    } else {
      console.error("Không tìm thấy chiến dịch trên Firestore với ID:", campaignId);
    }

    const res = await fetch('https://bfa8-2402-800-629f-adda-bd61-d642-91c2-8ceb.ngrok-free.app/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        orderInfo: `Ủng hộ chiến dịch ${campaignTitle}`,
        campaignId,
        campaignTitle,
        campaignCreatorId: emailCampaign || '',
        userId: user.uid || '',
        userName: user.name || '',
      }),
    });

    const data = await res.json();

    if (data && data.payUrl) {
      window.location.href = data.payUrl;
    } else {
      Swal.fire('Lỗi', 'Không tạo được liên kết thanh toán.', 'error');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
  }
};
