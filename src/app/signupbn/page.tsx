// src/app/(auth)/business-signup/page.tsx
"use client";

import BusinessSignupContainer from "../../components/auth/BusinessSignupForm";
import styles from "../../styles/auth/BusinessSignupPage.module.css";

export default function BusinessSignupPageWrapper() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>Đăng ký Doanh nghiệp</h1>
      <div className={styles.formContainer}>
        <BusinessSignupContainer />
      </div>
    </div>
  );
}
