'use client';
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@/styles/admin/BusinessVerificationModal.module.css";
import { approveBusinessVerification, rejectBusinessVerification } from "@/lib/firebase/businessVerificationService";

interface BusinessVerificationModalProps {
  userId: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function BusinessVerificationModal({
  userId,
  onClose,
  onApprove,
  onReject,
}: BusinessVerificationModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "businessVerifications", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu xác minh:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveBusinessVerification(userId);
      onApprove();
      onClose();
    } catch (error) {
      console.error("Lỗi phê duyệt:", error);
      alert("Đã xảy ra lỗi khi phê duyệt, vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (showRejectInput && rejectionReason.trim()) {
      try {
        setProcessing(true);
        await rejectBusinessVerification(userId, rejectionReason);
        onReject(rejectionReason);
        onClose();
      } catch (error) {
        console.error("Lỗi từ chối:", error);
        alert("Đã xảy ra lỗi khi từ chối, vui lòng thử lại.");
      } finally {
        setProcessing(false);
      }
    } else {
      setShowRejectInput(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p>Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} disabled={processing}>
          &times;
        </button>

        <h2>Thông tin xác minh doanh nghiệp</h2>

        <div className={styles.infoGroup}>
          <p><strong>Tên công ty:</strong> {data.companyName}</p>
          <p><strong>Mã số thuế:</strong> {data.taxCode}</p>
          <p><strong>Địa chỉ:</strong> {data.address}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Người đại diện:</strong> {data.representativeName}</p>
          <p><strong>Chức vụ:</strong> {data.position}</p>
          <p><strong>Số CCCD:</strong> {data.idNumber}</p>
          <p><strong>Tài khoản ngân hàng:</strong> {data.accountNumber} - {data.bankName} ({data.branch})</p>
          <p><strong>Chủ tài khoản:</strong> {data.accountHolder}</p>
        </div>

        <div className={styles.imageGroup}>
          <div>
            <p>Ảnh mặt trước CCCD:</p>
            <img src={data.idCardFrontUrl} alt="CCCD mặt trước" />
          </div>
          <div>
            <p>Ảnh mặt sau CCCD:</p>
            <img src={data.idCardBackUrl} alt="CCCD mặt sau" />
          </div>
          <div>
            <p>Ảnh chân dung:</p>
            <img src={data.portraitUrl} alt="Ảnh chân dung" />
          </div>
          <div>
            <p>Logo doanh nghiệp:</p>
            <img src={data.logoUrl} alt="Logo" />
          </div>
          <div>
            <p>Con dấu:</p>
            <img src={data.stampUrl} alt="Con dấu" />
          </div>
        </div>

        {showRejectInput && (
          <div className={styles.rejectInputArea}>
            <input
              placeholder="Nhập lý do từ chối"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={processing}
              autoFocus
            />
          </div>
        )}

        <div className={styles.actionArea}>
          <button
            className={styles.approveButton}
            onClick={handleApprove}
            disabled={processing}
          >
            {processing ? "Đang xử lý..." : "Phê duyệt"}
          </button>

          <button
            className={styles.rejectButton}
            onClick={handleReject}
            disabled={processing || (showRejectInput && !rejectionReason.trim())}
          >
            {showRejectInput ? "Xác nhận từ chối" : "Từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}
