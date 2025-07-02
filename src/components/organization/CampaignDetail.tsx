"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../../styles/organization/CampaignDetail.module.css";
import ParticipateTab from "./Sub/ParticipateTab";
import DonateTab from "./Sub/DonateTab";
import ReviewTab from "./Sub/ReviewTab";
import { toast } from "react-toastify";

interface CampaignDetailProps {
  campaign: any;
  onBack: () => void;
  onMessage?: (userId: string) => void;
}

export default function CampaignDetail({ campaign, onBack, onMessage }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<"participate" | "donate" | "review">("participate");
  const [isEditing, setIsEditing] = useState(false);

 const [editedCampaign, setEditedCampaign] = useState({
  ...campaign,
  startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : "",
  endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "",
});

  const formatDate = (date: Date) => {
    return date ? new Date(date).toLocaleDateString("vi-VN") : "N/A";
  };
const handleDelete = async () => {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa chiến dịch này?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "featured_activities", campaign.id));
    toast.success("Đã xóa chiến dịch thành công!");
    onBack();
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    toast.error("Đã xảy ra lỗi khi xóa chiến dịch.");
  }
};
  const handleSave = async () => {
    try {
      const campaignRef = doc(db, "featured_activities", campaign.id);
      await updateDoc(campaignRef, {
        title: editedCampaign.title,
        category: editedCampaign.category,
        description: editedCampaign.description,
        address: editedCampaign.address,
        phoneNumber: editedCampaign.phoneNumber,
        bankAccount: editedCampaign.bankAccount,
        bankName: editedCampaign.bankName,
        maxVolunteerCount: Number(editedCampaign.maxVolunteerCount) || 0,
        startDate: new Date(editedCampaign.startDate),
        endDate: new Date(editedCampaign.endDate),
      });
      setIsEditing(false);
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu.");
    }
  };

  return (
    <div className={styles.detailContainer}>
      <button onClick={onBack} className={styles.backButton}>← Quay lại</button>

      <div className={styles.detailContent}>
        <div className={styles.imageWrapper}>
          <img
            src={campaign.imageUrl || "/images/default_campaign.jpg"}
            alt={campaign.title}
            className={styles.detailImage}
          />
        </div>

        <div className={styles.infoWrapper}>
          <h2 className={styles.title}>
            {isEditing ? (
              <input
                type="text"
                className={styles.inputEdit}
                value={editedCampaign.title}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, title: e.target.value })}
              />
            ) : (
              campaign.title
            )}
          </h2>

          <div className={styles.infoBlock}>
            <strong>Danh mục:</strong>
            {isEditing ? (
              <input
                type="text"
                className={styles.inputEdit}
                value={editedCampaign.category}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, category: e.target.value })}
              />
            ) : (
              <span>{campaign.category}</span>
            )}
          </div>

          <div className={styles.infoBlock}>
            <strong>Mô tả:</strong>
            {isEditing ? (
              <textarea
                className={styles.textareaEdit}
                value={editedCampaign.description}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, description: e.target.value })}
              />
            ) : (
              <p className={styles.description}>{campaign.description}</p>
            )}
          </div>

          <div className={styles.infoBlock}>
          <strong>Thời gian:</strong>
          {isEditing ? (
            <>
              <input
                type="date"
                className={styles.inputEditSmall}
                value={editedCampaign.startDate}
                onChange={(e) =>
                  setEditedCampaign({ ...editedCampaign, startDate: e.target.value })
                }
              />
              <span> - </span>
              <input
                type="date"
                className={styles.inputEditSmall}
                value={editedCampaign.endDate}
                onChange={(e) =>
                  setEditedCampaign({ ...editedCampaign, endDate: e.target.value })
                }
              />
            </>
          ) : (
            <span>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          )}
        </div>


          <div className={styles.infoBlock}>
            <strong>Địa chỉ:</strong>
            {isEditing ? (
              <input
                type="text"
                className={styles.inputEdit}
                value={editedCampaign.address}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, address: e.target.value })}
              />
            ) : (
              <span>{campaign.address}</span>
            )}
          </div>

          <div className={styles.infoBlock}>
            <strong>Độ khẩn cấp:</strong> {campaign.urgency}
          </div>

          <div className={styles.inlineInfo}>
            <strong>Đã tham gia:</strong>
            {isEditing ? (
              <input
                type="number"
                className={styles.inputEditSmall}
                value={editedCampaign.maxVolunteerCount}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, maxVolunteerCount: e.target.value })}
              />
            ) : (
              <span>{campaign.participantCount} / {campaign.maxVolunteerCount}</span>
            )}
          </div>

          <div className={styles.inlineInfo}>
            <strong>SĐT:</strong>
            {isEditing ? (
              <input
                type="text"
                className={styles.inputEditSmall}
                value={editedCampaign.phoneNumber}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, phoneNumber: e.target.value })}
              />
            ) : (
              <span>{campaign.phoneNumber}</span>
            )}
          </div>

          <div className={styles.inlineInfo}>
            <strong>Số tài khoản:</strong>
            {isEditing ? (
              <>
                <input
                  type="text"
                  className={styles.inputEditSmall}
                  placeholder="Số tài khoản"
                  value={editedCampaign.bankAccount}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, bankAccount: e.target.value })}
                />
                <input
                  type="text"
                  className={styles.inputEditSmall}
                  placeholder="Ngân hàng"
                  value={editedCampaign.bankName}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, bankName: e.target.value })}
                />
              </>
            ) : (
              <span>{campaign.bankAccount} ({campaign.bankName})</span>
            )}
          </div>

          <div className={styles.infoBlock}>
            <strong>Tổng quyên góp:</strong> {campaign.totalDonationAmount?.toLocaleString()} đ
          </div>

         <div className={styles.buttonRow}>
          {isEditing ? (
            <>
              <button onClick={handleSave} className={styles.saveButton}>Lưu</button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Hủy</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className={styles.editButton}>Chỉnh sửa</button>
              <button onClick={handleDelete} className={styles.deleteButton}>Xóa</button>
            </>
          )}
        </div>

        </div>
      </div>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "participate" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("participate")}
        >
          Tham gia
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "donate" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("donate")}
        >
          Đóng góp
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "review" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("review")}
        >
          Đánh giá
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "participate" && (
          <ParticipateTab campaignId={campaign.id} onMessage={onMessage} />
        )}

        {activeTab === "donate" && <DonateTab campaignId={campaign.id} />}
        {activeTab === "review" && <ReviewTab campaignId={campaign.id} />}
      </div>
    </div>
  );
}
