// src/components/auth/business-signup/Step3Completion.tsx
import React from "react";
import styles from "../../../styles/auth/BusinessSignup.module.css"; // Đảm bảo đường dẫn đúng
import { NextRouter } from "next/router"; // Import NextRouter type

interface Step3CompletionProps {
  router: any; // Use 'any' or NextRouter if you set up next/router type
}

export default function Step3Completion({ router }: Step3CompletionProps) {
  return (
    <div className={styles.completionScreen}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.title}>Đăng ký hoàn tất!</h2>
      <p className={styles.successMessage}>
        Yêu cầu đăng ký của bạn đã được gửi thành công. Vui lòng kiểm tra email trong 2 ngày để nhận kết quả xét duyệt từ admin.
      </p>
      <button
        className={styles.homeButton}
        onClick={() => router.push("/")}
      >
        Trở về trang chủ
      </button>
    </div>
  );
}