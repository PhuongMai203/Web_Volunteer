"use client";

import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import styles from "../../styles/auth/SignupForm.module.css";
import PasswordCheck from "./PasswordCheck";
import { useRouter } from "next/navigation";

type SignupFormProps = {
  email: string;
  password: string;
  name: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setName: (value: string) => void;
  onSwitch: () => void;
};

export default function SignupForm({
  email,
  password,
  name,
  setEmail,
  setPassword,
  setName,
  onSwitch,
}: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin vào Firestore với role mặc định là "user"
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        avatarUrl: "/images/default_avatar.jpg",
        role: "user",
      });

      // Lưu vào localStorage
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          uid: user.uid,
          fullName: name,
          email,
          name,
          avatarUrl: "/images/default_avatar.jpg",
          phone: "",
          address: "",
          birthYear: "",
          rank: "Đồng",
          bookmarkedEvents: [],
        })
      );

      alert("Đăng ký tài khoản thành công!");
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.formSpace} onSubmit={handleSignup}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          placeholder="email@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
        <PasswordCheck password={password} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tên đăng nhập</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Đang tạo tài khoản..." : "TẠO TÀI KHOẢN"}
      </button>

      <p className={styles.signupText}>
        Bạn đã có tài khoản?
        <button type="button" className={styles.signupLink} onClick={onSwitch}>
          Đăng nhập
        </button>
      </p>
    </form>
  );
}
