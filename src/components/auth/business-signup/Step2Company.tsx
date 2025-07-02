// src/components/auth/business-signup/Step2Company.tsx
import React from "react";
import styles from "../../../styles/auth/BusinessSignup.module.css";

interface Step2CompanyProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  taxCode: string;
  setTaxCode: (value: string) => void;
  license: string;
  setLicense: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  representativeName: string;
  setRepresentativeName: (value: string) => void;
  position: string;
  setPosition: (value: string) => void;
  idNumber: string;
  setIdNumber: (value: string) => void;
  idCardFront: File | null;
  setIdCardFront: (file: File | null) => void;
  idCardBack: File | null;
  setIdCardBack: (file: File | null) => void;
  portrait: File | null;
  setPortrait: (file: File | null) => void;
  logo: File | null;
  setLogo: (file: File | null) => void;
  stamp: File | null;
  setStamp: (file: File | null) => void;
  bankName: string;
  setBankName: (value: string) => void;
  branch: string;
  setBranch: (value: string) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  accountHolder: string;
  setAccountHolder: (value: string) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step2Company({
  companyName,
  setCompanyName,
  taxCode,
  setTaxCode,
  license,
  setLicense,
  address,
  setAddress,
  representativeName,
  setRepresentativeName,
  position,
  setPosition,
  idNumber,
  setIdNumber,
  idCardFront,
  setIdCardFront,
  idCardBack,
  setIdCardBack,
  portrait,
  setPortrait,
  logo,
  setLogo,
  stamp,
  setStamp,
  bankName,
  setBankName,
  branch,
  setBranch,
  accountNumber,
  setAccountNumber,
  accountHolder,
  setAccountHolder,
  loading,
  error,
  onBack,
  onSubmit,
}: Step2CompanyProps) {
  return (
    <div className={styles.formSpace}>
      <h2 className={styles.title}>Thông tin doanh nghiệp</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thông tin công ty</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên công ty</label>
          <input
            className={styles.input}
            placeholder="Tên công ty"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Mã số thuế</label>
          <input
            className={styles.input}
            placeholder="Mã số thuế"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Giấy phép kinh doanh</label>
          <input
            className={styles.input}
            placeholder="Số giấy phép kinh doanh"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Địa chỉ trụ sở chính</label>
          <input
            className={styles.input}
            placeholder="Địa chỉ công ty"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Người đại diện pháp luật</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Họ và tên</label>
          <input
            className={styles.input}
            placeholder="Họ và tên"
            value={representativeName}
            onChange={(e) => setRepresentativeName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Chức vụ</label>
          <input
            className={styles.input}
            placeholder="Chức vụ"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Số CCCD</label>
          <input
            className={styles.input}
            placeholder="Số căn cước công dân"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh CCCD mặt trước</label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setIdCardFront(e.target.files?.[0] || null)}
          />
          {idCardFront && <p className={styles.fileStatus}>Đã chọn: {idCardFront.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh CCCD mặt sau</label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setIdCardBack(e.target.files?.[0] || null)}
          />
          {idCardBack && <p className={styles.fileStatus}>Đã chọn: {idCardBack.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ảnh chân dung</label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setPortrait(e.target.files?.[0] || null)}
          />
          {portrait && <p className={styles.fileStatus}>Đã chọn: {portrait.name}</p>}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Logo và con dấu</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Logo công ty</label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
          {logo && <p className={styles.fileStatus}>Đã chọn: {logo.name}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Con dấu công ty</label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={(e) => setStamp(e.target.files?.[0] || null)}
          />
          {stamp && <p className={styles.fileStatus}>Đã chọn: {stamp.name}</p>}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Thông tin tài khoản ngân hàng</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên ngân hàng</label>
          <input
            className={styles.input}
            placeholder="Tên ngân hàng"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Chi nhánh</label>
          <input
            className={styles.input}
            placeholder="Chi nhánh"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Số tài khoản</label>
          <input
            className={styles.input}
            placeholder="Số tài khoản"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Chủ tài khoản</label>
          <input
            className={styles.input}
            placeholder="Chủ tài khoản"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
          />
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.buttonGroup}>
        <button
          className={styles.backButton}
          onClick={onBack}
          disabled={loading}
        >
          ← Quay lại
        </button>
        <button
          className={styles.submitButton}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Gửi xác minh →"}
        </button>
      </div>
    </div>
  );
}