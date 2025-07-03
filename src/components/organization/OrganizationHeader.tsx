"use client";

import Image from "next/image";
import { UserInfo } from "@/components/types/user";
import { Edit, Mail, UserCircle, Settings, LogOut, Lock, FileText } from "lucide-react";
import styles from "../../styles/Account/AccountSub.module.css";
import { auth, db, storage } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

interface HeaderProps {
  userInfo: UserInfo;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  setUserInfo: (val: UserInfo) => void;
  refreshUserInfo: (uid: string) => void;
}

export default function OrganizationHeader({
  userInfo,
  isEditing,
  setIsEditing,
  setUserInfo,
  refreshUserInfo,
}: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showSecurityOptions, setShowSecurityOptions] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/default_avatar.jpg");

  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setAvatarUrl(userInfo.avatarUrl || "/images/default_avatar.jpg");
  }, [userInfo.avatarUrl]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      toast.success("Bạn đã đăng xuất thành công!");
      window.location.href = "/account";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản? Sau 3 ngày, tài khoản sẽ bị xóa vĩnh viễn nếu bạn không đăng nhập lại."
    );
    if (confirmed) {
      try {
        const deleteTime = new Date();
        deleteTime.setDate(deleteTime.getDate() + 3);

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

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const storageRef = ref(storage, `user_images/${userInfo.uid}/avatar.jpg`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        const userRef = doc(db, "users", userInfo.uid);
        await updateDoc(userRef, { avatarUrl: imageUrl });

        localStorage.removeItem("accountPageData");

        alert("Cập nhật ảnh đại diện thành công!");
        refreshUserInfo(userInfo.uid);
      } catch (error) {
        console.error("Lỗi khi cập nhật ảnh:", error);
        alert("Đã xảy ra lỗi khi cập nhật ảnh đại diện.");
      }
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 relative">
      <div className={styles.avatarWrapper}>
        <Image
        src={avatarUrl}
        alt="avatar"
        fill
        sizes="(max-width: 768px) 80px, 100px"
        className={styles.avatarImage}
        />

        <label className={styles.editAvatarBtn}>
          <Edit size={16} />
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleChangeAvatar} />
        </label>
      </div>

      <div className={styles.basicInfo}>
        <div className={styles.userItem}>
          <UserCircle size={24} className={styles.orangeIcon} />
          <span className="text-3xl font-bold text-gray-800">{userInfo.name}</span>
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
          <button className={styles.settingsButton} onClick={() => setShowMenu(!showMenu)}>
            <Settings size={30} className={styles.orangeIcon} />
          </button>

          <div className={`${styles.dropdownMenu} ${showMenu ? styles.active : ""}`}>
            <div>
              <button onClick={() => setShowSecurityOptions(!showSecurityOptions)}>
                <Lock size={16} /> Bảo mật và mật khẩu
              </button>
              {showSecurityOptions && (
                <div className={styles.subMenu}>
                  <button onClick={() => router.push("/signin?forgot=true")}>Đặt lại mật khẩu</button>
                  <button onClick={handleDeleteAccount}>Xóa tài khoản</button>
                </div>
              )}
            </div>
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
  );
}
