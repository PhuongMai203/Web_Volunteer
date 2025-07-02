"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "../../styles/auth/SignIn.module.css";
import SignupForm from "@/components/auth/SignupForm";

const labels = ["Minh bạch", "Uy tín", "Bảo mật", "Rõ ràng", "Tận tâm", "Chính xác"];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");  

  return (
    <div className={styles.container}>

      <div className={styles.mainContent}>
        {/* Bên trái */}
        <div className={styles.leftSection}>
          <div className={styles.leftContent}>
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <Image src="/images/logo.jpg" alt="Logo" width={110} height={110} />
              </div>
            </div>
            <h1 className={styles.title}>Chào mừng đến với ThienNguyen</h1>
            <p className={styles.description}>
              Nền tảng kết nối thiện nguyện với cộng đồng – Nhanh chóng, minh bạch, hiệu quả.
            </p>
            <div className={styles.labelsGrid}>
              {labels.map((label, i) => (
                <div key={i} className={styles.labelItem} style={{ animationDelay: `${i * 0.1}s` }}>
                  <p className={styles.labelTitle}>{label}</p>
                  <p className={styles.labelCheck}>✓</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bên phải */}
        <div className={styles.rightSection}>
          <div className={styles.loginCard}>
            <h1 className={styles.loginTitle}>ĐĂNG KÝ</h1>
            <SignupForm
              email={email}
              password={password}
              name={name}          
              setEmail={setEmail}
              setPassword={setPassword}
              setName={setName}
              onSwitch={() => window.location.href = "/signin"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
