"use client";
import Image from "next/image";
import { Lock, X, User, CreditCard } from "lucide-react";
import styles from "../../../styles/Account/AccountSub.module.css";
import { useState } from "react";

interface AccountIdentityProps {
  cccdFront: File | null;
  cccdBack: File | null;
  portrait: File | null;
  setCccdFront: React.Dispatch<React.SetStateAction<File | null>>;
  setCccdBack: React.Dispatch<React.SetStateAction<File | null>>;
  setPortrait: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileUpload: (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function AccountIdentity({
  cccdFront,
  cccdBack,
  portrait,
  setCccdFront,
  setCccdBack,
  setPortrait,
  handleFileUpload,
}: AccountIdentityProps) {
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const handleVerify = async () => {
    if (!cccdFront || !portrait) {
      alert("Vui lòng chọn đầy đủ ảnh CCCD mặt trước và ảnh chân dung.");
      return;
    }

    const formData = new FormData();
    formData.append("id_card", cccdFront);
    formData.append("selfie", portrait);

    try {
      const res = await fetch("http://localhost:3000/verify-face", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        if (result.match) {
          alert(`✅ Xác minh thành công! Độ tương đồng: ${(result.similarity * 100).toFixed(2)}%`);
          // Có thể xử lý tiếp như gửi fullName, idNumber lên server của bạn nếu cần
        } else {
          alert(`❌ Khuôn mặt không khớp. Độ tương đồng: ${(result.similarity * 100).toFixed(2)}%`);
        }
      } else {
        alert(result.error || "Lỗi xác minh.");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối tới máy chủ xác minh.");
    }
  };

  return (
    <div className={styles.identityBox}>
      <h2 className={styles.sectionTitle}>
        <Lock className={styles.iconOrange} size={20} />
        Xác minh danh tính
      </h2>

      {/* Ô nhập thông tin */}
      <div className={styles.infoGrid}>
        <div>
          <label className={styles.label}>
            <User size={16} className={styles.orangeIcon} /> Họ và tên
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Nhập họ tên đầy đủ"
            value={fullName}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^A-Za-zÀ-ỹ\s]/g, "");
              setFullName(onlyLetters.toUpperCase());
            }}
          />
        </div>
        <div>
          <label className={styles.label}>
            <CreditCard size={16} className={styles.orangeIcon} /> Số căn cước công dân
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Nhập số CCCD"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>
      </div>

      {/* Các phần tải ảnh */}
      <div className={styles.uploadGrid}>
        <UploadSection
          label="Mặt trước CCCD"
          file={cccdFront}
          onRemove={() => setCccdFront(null)}
          onUpload={(e) => handleFileUpload(setCccdFront, e)}
        />

        <UploadSection
          label="Mặt sau CCCD"
          file={cccdBack}
          onRemove={() => setCccdBack(null)}
          onUpload={(e) => handleFileUpload(setCccdBack, e)}
        />

        <UploadSection
          label="Ảnh chân dung"
          file={portrait}
          onRemove={() => setPortrait(null)}
          onUpload={(e) => handleFileUpload(setPortrait, e)}
          emoji="📸"
        />
      </div>

      <div className={styles.warningBox}>
        <div className={styles.warningIcon}>
          <svg className={styles.warningSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className={styles.warningText}>
          <p>Thông tin xác minh sẽ được bảo mật và chỉ sử dụng cho mục đích nhận dạng người dùng.</p>
        </div>
      </div>

      <div className={styles.verifyButtonWrapper}>
        <button className={styles.verifyButton} onClick={handleVerify}>
          XÁC MINH
        </button>
      </div>
    </div>
  );
}

function UploadSection({
  label,
  file,
  onRemove,
  onUpload,
  emoji = "🪪",
}: {
  label: string;
  file: File | null;
  onRemove: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emoji?: string;
}) {
  return (
    <div className={styles.uploadItem}>
      <label className={styles.uploadLabel}>{label}</label>
      <div className={styles.uploadPreview}>
        {file ? (
          <>
            <Image
              src={URL.createObjectURL(file)}
              alt={label}
              layout="fill"
              objectFit="cover"
            />
            <button onClick={onRemove} className={styles.removeButton}>
              <X size={16} />
            </button>
          </>
        ) : (
          <div className={styles.noImage}>
            <div className={styles.noImageEmoji}>{emoji}</div>
            <p className={styles.noImageText}>Chưa có ảnh</p>
          </div>
        )}
      </div>
      <label className={styles.uploadButton}>
        <span>Tải lên</span>
        <input type="file" className={styles.hiddenInput} onChange={onUpload} />
      </label>
    </div>
  );
}
