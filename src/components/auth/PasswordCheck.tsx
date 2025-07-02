"use client";
import styles from "../../styles/auth/SignIn.module.css";

export default function PasswordCheck({ password }: { password: string }) {
  const rules = [
    { label: "1 chữ thường", isValid: /[a-z]/.test(password) },
    { label: "1 chữ hoa", isValid: /[A-Z]/.test(password) },
    { label: "1 số", isValid: /\d/.test(password) },
    { label: "1 ký tự đặc biệt", isValid: /[^A-Za-z0-9]/.test(password) },
    { label: "8 ký tự", isValid: password.length >= 8 },
  ];

  return (
    <div className={styles.passwordCheckList}>
      {rules.map((item, index) => (
        <div
          key={index}
          className={styles.passwordCheckItem}
          style={{ color: item.isValid ? "green" : "#888", fontSize: "13px" }}
        >
          ⚈ {item.label}
        </div>
      ))}
    </div>
  );
}
