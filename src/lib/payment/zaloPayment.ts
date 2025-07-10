import Swal from "sweetalert2";

export const handleZaloPayPayment = async (
  campaignId: string,
  campaignTitle: string,
  campaignCreatorId: string,
  amount: number,
  user: { uid: string; name: string }
) => {
  try {
    const appTransId = generateAppTransId();
    const callback_url = process.env.NEXT_PUBLIC_CALLBACK_URL;
    const res = await fetch("https://bfa8-2402-800-629f-adda-bd61-d642-91c2-8ceb.ngrok-free.app/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        app_trans_id: appTransId,
        app_user: user.uid,
        amount,
        callback_url: callback_url,
        description: `Ủng hộ chiến dịch ${campaignTitle}`,
        campaign_id: campaignId,
        bank_code: "",
        campaign_title: campaignTitle,
        campaign_creator_id: campaignCreatorId, 
        user_name: user.name                     
    }),
    });


    const data = await res.json();

    if (data && data.order_url) {
      window.location.href = data.order_url;
    } else {
      Swal.fire("Lỗi", "Không tạo được liên kết thanh toán ZaloPay.", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Lỗi", "Có lỗi xảy ra với ZaloPay, vui lòng thử lại.", "error");
  }
};

const generateAppTransId = () => {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 1000000);
  return `${yy}${mm}${dd}_${rand}`;
};
