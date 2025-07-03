"use client";
import Image from "next/image";
import { Edit,  Mail, UserCircle, Settings, LogOut, UserCheck, Lock, FileText } from "lucide-react";
import styles from "../../../styles/Account/AccountSub.module.css";
import {  auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";

interface UserInfo {
  uid: string;
  fullName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthYear: string;
  avatarUrl?: string;
  rank?: string;
}

interface HeaderProps {
  userInfo: UserInfo;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}

export default function AccountHeader({ userInfo }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
const [showSecurityOptions, setShowSecurityOptions] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("accountPageData"); // Xóa luôn dữ liệu cache
    toast.success("Bạn đã đăng xuất thành công!");
    window.location.href = "/account"; // Reload toàn bộ trang cho chắc chắn
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    toast.error("Đã xảy ra lỗi khi đăng xuất.");
  }
};
const handleDeleteAccount = async () => {
  const confirmed = window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Sau 3 ngày, tài khoản sẽ bị xóa vĩnh viễn nếu bạn không đăng nhập lại.");

  if (confirmed) {
    try {
      const deleteTime = new Date();
      deleteTime.setDate(deleteTime.getDate() + 3); // 3 ngày sau

      await fetch("/api/scheduleDelete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userInfo.uid, deleteAt: deleteTime.toISOString() }),
      });

      alert("Tài khoản của bạn đã được lên lịch xóa sau 3 ngày.");
      handleLogout();
    } catch (error) {
      console.error("Lỗi khi lên lịch xóa:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  }
};

  if (!hasMounted) return null;

  return (
    <div className={styles.header}>
      <div className="flex flex-col md:flex-row items-center gap-6 relative">
        <div className={styles.avatarWrapper}>
          <Image
            src={userInfo.avatarUrl || "/images/default_avatar.jpg"}
            alt="avatar"
            fill
            className={styles.avatarImage}
          />
          <button className={styles.editAvatarBtn}><Edit size={16} /></button>
        </div>
        <div className={styles.basicInfo}>
          <div className={styles.nameAndRank}>
            <div className={styles.userItem}>
              <UserCircle size={24} className={styles.orangeIcon} />
              <span className="text-3xl font-bold text-gray-800">{userInfo.name}</span>
            </div>
            <span className={styles.rankTag}>{userInfo.rank}</span>
          </div>

          <div className={styles.userDetails}>
            <div className={styles.userItem}>
              <Mail size={24} className={styles.orangeIcon} />
              <span>{userInfo.email}</span>
            </div>
          </div>
        </div>

        <div className={styles.controlButtons}>

          <div className={styles.settingsWrapper}>
        <button
          className={styles.settingsButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <Settings size={30} className={styles.orangeIcon} />
        </button>

        <div
          className={`${styles.dropdownMenu} ${showMenu ? styles.active : ""}`}
        >
          <button onClick={() => router.push("/account/info")}>
            <UserCircle size={16} /> Quản lý thông tin cá nhân
          </button>

          <div>
            <button onClick={() => setShowSecurityOptions(!showSecurityOptions)}>
              <Lock size={16} /> Bảo mật và mật khẩu
            </button>
            {showSecurityOptions && (
              <div className={styles.subMenu}>
                <button onClick={() => router.push("/signin?forgot=true")}>
                  Đặt lại mật khẩu
                </button>
                <button onClick={() => handleDeleteAccount()}>
                  Xóa tài khoản
                </button>

              </div>
            )}
          </div>

          <button onClick={() => router.push("/account/identity")}>
            <UserCheck size={16} /> Xác minh danh tính
          </button>

          <button onClick={() => router.push("/account/privacy")}>
            <FileText size={16} /> Chính sách và quyền riêng tư
          </button>

          <button onClick={handleLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

        </div>
      </div>
    </div>
  );
}
