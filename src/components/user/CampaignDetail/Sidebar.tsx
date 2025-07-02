import React from "react";
import styles from "../../../styles/Campaigns/CampaignDetail.module.css";
import { CampaignDetailClient } from "../../types/campaign";
import Swal from "sweetalert2";
import { registerForCampaign } from "@/lib/firebase/getCampaignRegistrations";
import { getUserInfoFromFirestore } from "@/lib/firebase/getUserInfo";
import { handleMomoPayment } from "@/lib/payment/momoPayment";
import { handleZaloPayPayment } from "@/lib/payment/zaloPayment";

interface UserInfo {
  uid: string;
  name: string;
}

interface CampaignDetailSidebarProps {
  campaign: CampaignDetailClient;
  userInfo: UserInfo | null;
}

export default function CampaignDetailSidebar({
  campaign,
  userInfo,
}: CampaignDetailSidebarProps) {
  const handleRegister = async (participationType: string) => {
    if (!userInfo) {
      Swal.fire("Vui lòng đăng nhập để tham gia!");
      return;
    }

    const confirmResult = await Swal.fire({
      title: `Xác nhận ${participationType.toLowerCase()}?`,
      text: `Bạn chắc chắn muốn ${participationType.toLowerCase()} cho chiến dịch "${campaign.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (confirmResult.isConfirmed) {
      const userInfoFromFirestore = await getUserInfoFromFirestore(userInfo.uid);
      if (!userInfoFromFirestore) {
        Swal.fire("Lỗi", "Không lấy được thông tin người dùng.", "error");
        return;
      }

      const success = await registerForCampaign(
        userInfo.uid,
        campaign,
        userInfoFromFirestore,
        participationType
      );

      if (success) {
        Swal.fire("Thành công!", `${participationType} cho chiến dịch thành công.`, "success");
      } else {
        Swal.fire("Lỗi", "Có lỗi xảy ra, vui lòng thử lại sau.", "error");
      }
    }
  };

  const totalTarget = campaign.maxVolunteerCount || 0;
  const currentParticipants = campaign.participantCount || 0;
  const progressPercentage = totalTarget > 0 ? Math.min((currentParticipants / totalTarget) * 100, 100) : 0;

  const handleDonate = async () => {
    if (!userInfo) {
      Swal.fire("Vui lòng đăng nhập để ủng hộ!");
      return;
    }

    const { value: paymentMethod } = await Swal.fire({
      title: "Chọn phương thức thanh toán",
      input: "radio",
      inputOptions: {
        momo: "Thanh toán MoMo",
        zalopay: "Thanh toán ZaloPay",
      },
      inputValidator: (value) => !value ? "Vui lòng chọn phương thức thanh toán!" : undefined,
      confirmButtonText: "Tiếp tục",
      cancelButtonText: "Hủy",
      showCancelButton: true,
    });

    if (!paymentMethod) return;

    const amountPrompt = await Swal.fire({
      title: "Nhập số tiền ủng hộ (VND)",
      input: "number",
      inputAttributes: { min: "10000", step: "10000" },
      inputValidator: (value) => (!value || parseInt(value) < 1000) ? "Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 VND)" : undefined,
      showCancelButton: true,
    });

    if (!amountPrompt.isConfirmed) return;
    const amount = parseInt(amountPrompt.value);

    if (paymentMethod === "momo") {
      await handleMomoPayment(campaign.id, campaign.title, amount, { uid: userInfo.uid, name: userInfo.name });
    } else if (paymentMethod === "zalopay") {
      await handleZaloPayPayment(campaign.id, campaign.title, campaign.creatorId, amount, { uid: userInfo.uid, name: userInfo.name });
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.actionCard}>
        <h3>Tham gia ngay</h3>
        <p>Hãy chung tay hỗ trợ chiến dịch này!</p>
        <div className={styles.progressContainer}>
          <div className={styles.progressLabels}>
            <span>Mục tiêu: {totalTarget.toLocaleString()} người</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {campaign.bankAccount?.trim() && (
          <button className={styles.donateButton} onClick={handleDonate}>Ủng hộ ngay</button>
        )}

        <button className={styles.volunteerButton} onClick={() => handleRegister("Tham gia tình nguyện trực tiếp")}>
          Đăng ký tình nguyện
        </button>

        <button className={styles.donateButton} onClick={() => handleRegister("Đóng góp vật phẩm")}>
          Đóng góp vật phẩm
        </button>
      </div>

      <h3 className={styles.bankTitle}>Thông tin ngân hàng</h3>
        <div className={styles.bankContainer}>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Ngân hàng:</span>
            <span className={styles.bankValue}>{campaign.bankName}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Số tài khoản:</span>
            <span className={styles.bankValue}>{campaign.bankAccount}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Chủ tài khoản:</span>
            <span className={styles.bankValue}>Quỹ Từ thiện Vì Cộng đồng</span>
          </div>
          <div className={styles.bankNote}>
            Vui lòng ghi rõ nội dung: <strong>"Ủng hộ {campaign.title}"</strong>
          </div>
        </div>

    </div>
  );
}
