"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import styles from "../../styles/auth/SignIn.module.css";
import { toast } from "react-toastify";

type LoginFormProps = {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSwitch: () => void;
};

export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  onSwitch,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgot = searchParams?.get("forgot");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    setHasMounted(true);
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }, []);

  useEffect(() => {
    if (forgot === "true") {
      setShowForgotPassword(true);
    }
  }, [forgot]);

const handleLogin = async () => {
  setLoading(true);
  setError("");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    if (userData.scheduledDeleteAt) {
      const deleteAt = new Date(userData.scheduledDeleteAt);
      const now = new Date();

      if (now >= deleteAt) {
        toast.error("Tài khoản của bạn đã hết thời gian chờ và sẽ bị xóa.");
        return;
      } else {
        await updateDoc(userDocRef, { scheduledDeleteAt: null });
        toast.success("Tài khoản của bạn đã được khôi phục.");
      }
    }

    if (userData.isDisabled) {
      toast.error("Tài khoản của bạn đã bị vô hiệu hóa do vi phạm tiêu chuẩn cộng đồng. Liên hệ quản trị viên.");
      return;
    }

    if (userData.isApproved === false) {
      toast.warning("Tài khoản của bạn chưa được phê duyệt. Vui lòng kiểm tra email hoặc liên hệ quản trị viên.");
      return;
    }

    const commonUserInfo = {
      uid: user.uid,
      fullName: userData.fullName || user.displayName || "",
      email: user.email,
      name: userData.name || user.displayName || "Tên hiển thị",
      avatarUrl: userData.avatarUrl || "/images/default_avatar.jpg",
      phone: userData.phone || "",
      address: userData.address || "",
      birthYear: userData.birthYear || "",
      rank: userData.rank || "Đồng",
    };

    if (userData.role === "user") {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...commonUserInfo,
          bookmarkedEvents: userData.bookmarkedEvents || [],
        })
      );

      toast.success("Đăng nhập thành công!");
      router.push("/");
    } else if (userData.role === "organization") {
      localStorage.setItem(
        "accountPageData",
        JSON.stringify({
          userInfo: commonUserInfo,
        })
      );

      toast.success("Đăng nhập thành công!");
      router.push("/organization/dashboard");
    } else {
      toast.error("Tài khoản của bạn không được phép truy cập hệ thống.");
    }
  } catch (error: unknown) {
    console.error(error);
    setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.");
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    setLoading(true);
    setResetMessage("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(
        "Link đặt lại mật khẩu đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư."
      );
    } catch (error) {
      console.error(error);
      setResetMessage("Email không hợp lệ hoặc chưa được đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <form className={styles.formSpace} onSubmit={(e) => e.preventDefault()}>
      {!showForgotPassword ? (
        <>
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
          </div>

          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input type="checkbox" defaultChecked /> Ghi nhớ mật khẩu
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className={styles.forgotPassword}
            >
              Quên mật khẩu?
            </button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
          </button>

          <p className={styles.signupText}>
            Bạn chưa có tài khoản?
            <button type="button" className={styles.signupLink} onClick={onSwitch}>
              Đăng ký tài khoản
            </button>
          </p>
        </>
      ) : (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nhập email để đặt lại mật khẩu:</label>
            <input
              type="email"
              className={styles.input}
              placeholder="email@gmail.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
          </button>

          {resetMessage && <p className={styles.infoText}>{resetMessage}</p>}

          <button
            type="button"
            className={styles.backToLogin}
            onClick={() => {
              setShowForgotPassword(false);
              setResetEmail("");
              setResetMessage("");
            }}
          >
            Quay lại đăng nhập
          </button>
        </>
      )}
    </form>
  );
}
