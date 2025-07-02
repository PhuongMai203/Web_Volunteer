// src/components/auth/business-signup/Step1Account.tsx
import React from "react";
import styles from "../../../styles/auth/BusinessSignup.module.css"; // Đảm bảo đường dẫn đúng

interface Step1AccountProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  loading: boolean;
  error: string;
  onNext: () => void;
}

export default function Step1Account({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  loading,
  error,
  onNext,
}: Step1AccountProps) {
  return (
    <div className={styles.formSpace}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          placeholder="Email công ty"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Mật khẩu</label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tên đăng nhập</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Tên đăng nhập"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <button
        className={styles.submitButton}
        onClick={onNext}
        disabled={loading || !email || !password || !name}
      >
        {loading ? "Đang đăng ký..." : "Tiếp theo →"}
      </button>
    </div>
  );
}