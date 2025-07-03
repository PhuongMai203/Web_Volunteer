"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db, googleProvider, facebookProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import styles from "@/styles/auth/SignIn.module.css";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const labels = ["Minh bạch", "Uy tín", "Bảo mật", "Rõ ràng", "Tận tâm", "Chính xác"];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode");
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsSignup(mode === "signup");
  }, [mode]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      // Luôn merge role: "user" nếu tài khoản mới
      await setDoc(
        userRef,
        {
          name: user.displayName || "Người dùng ẩn danh",
          email: user.email,
          avatarUrl: user.photoURL || "/images/default_avatar.jpg",
          role: "user",
        },
        { merge: true }
      );

      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "user") {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: user.uid,
            fullName: user.displayName || "Người dùng ẩn danh",
            email: user.email,
            name: user.displayName || "Người dùng ẩn danh",
            avatarUrl: user.photoURL || "/images/default_avatar.jpg",
            phone: "",
            address: "",
            birthYear: "",
            rank: "Đồng",
            bookmarkedEvents: [],
          })
        );

        alert("Đăng nhập Google thành công!");
        router.push("/");
      } else {
        alert("Tài khoản của bạn không được phép truy cập.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      alert("Đăng nhập Google thất bại.");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          name: user.displayName || "Người dùng ẩn danh",
          email: user.email,
          avatarUrl: user.photoURL || "/images/default_avatar.jpg",
          role: "user",
        },
        { merge: true }
      );

      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "user") {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            uid: user.uid,
            fullName: user.displayName || "Người dùng ẩn danh",
            email: user.email,
            name: user.displayName || "Người dùng ẩn danh",
            avatarUrl: user.photoURL || "/images/default_avatar.jpg",
            phone: "",
            address: "",
            birthYear: "",
            rank: "Đồng",
            bookmarkedEvents: [],
          })
        );

        alert("Đăng nhập Facebook thành công!");
        router.push("/");
      } else {
        alert("Tài khoản của bạn không được phép truy cập.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Facebook:", error);
      alert("Đăng nhập Facebook thất bại.");
    }
  };

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
                <div
                  key={i}
                  className={styles.labelItem}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
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
            <h1 className={styles.loginTitle}>{isSignup ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}</h1>
            {isSignup ? (
              <SignupForm
                email={email}
                password={password}
                name={name}
                setEmail={setEmail}
                setPassword={setPassword}
                setName={setName}
                onSwitch={() => setIsSignup(false)}
              />
            ) : (
              <>
                <LoginForm
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  onSwitch={() => setIsSignup(true)}
                />
                <div className={styles.orDivider}>
                  <div className={styles.dividerLine}></div>
                  <span className={styles.orText}>HOẶC</span>
                  <div className={styles.dividerLine}></div>
                </div>
                <div className={styles.socialLoginButtons}>
                  <button className={styles.socialButton} onClick={handleGoogleLogin}>
                    <Image src="/images/google_logo.jpg" alt="Google" width={40} height={40} />
                  </button>
                  <button className={styles.socialButton} onClick={handleFacebookLogin}>
                    <Image src="/images/facebook.jpg" alt="Facebook" width={40} height={40} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
