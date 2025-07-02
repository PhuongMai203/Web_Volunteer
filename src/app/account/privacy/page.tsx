// PolicyPage.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/Account/PrivacyPolicy.module.css";
import { getSystemSettings } from "@/lib/firebase/systemSettingsService";

export default function PolicyPage() {
  const [termsOfUse, setTermsOfUse] = useState<string>("");
  const [privacyPolicy, setPrivacyPolicy] = useState<string>("");
  const [volunteerPolicy, setVolunteerPolicy] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      const settings = await getSystemSettings();
      console.log("Dữ liệu lấy từ Firestore:", settings);

      if (settings?.policySettings && settings?.generalInfo?.email) {
        setTermsOfUse(settings.policySettings.termsOfUse || "");
        setPrivacyPolicy(settings.policySettings.privacyPolicy || "");
        setVolunteerPolicy(settings.policySettings.volunteerPolicy || "");
        setEmail(settings.generalInfo.email || "");
      }

      setLoading(false);
    };

    fetchPolicy();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        Đang tải...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Chính sách & Điều khoản</h1>
        <p>Chúng tôi cam kết bảo vệ quyền riêng tư và minh bạch trong mọi hoạt động</p>
      </div>
      
      <div className={styles.gridContainer}>
        <div className={styles.policyColumn}>
          <h1 className={styles.title}>Điều khoản sử dụng</h1>
          {termsOfUse ? (
            termsOfUse.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <div className={styles.emptyContent}>Chưa có nội dung.</div>
          )}
          <p className={styles.email}>{email}</p>
        </div>

        <div className={styles.policyColumn}>
          <h1 className={styles.title}>Chính sách và quyền riêng tư</h1>
          {privacyPolicy ? (
            privacyPolicy.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <div className={styles.emptyContent}>Chưa có nội dung.</div>
          )}
          <p className={styles.email}>{email}</p>
        </div>

        <div className={styles.policyColumn}>
          <h1 className={styles.title}>Chính sách hoạt động tình nguyện</h1>
          {volunteerPolicy ? (
            volunteerPolicy.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <div className={styles.emptyContent}>Chưa có nội dung.</div>
          )}
          <p className={styles.email}>{email}</p>
        </div>
      </div>
    </div>
  );
}