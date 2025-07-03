'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { FaBars, FaSignOutAlt, FaBell } from 'react-icons/fa';
import styles from "@/styles/admin/HeaderAdmin.module.css";
import { getNotifications, Notification } from "@/lib/firebase/getNotifications";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";

interface HeaderAdminProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  adminData: {
    name: string;
    email: string;
  };
}

export default function HeaderAdmin({ sidebarOpen, setSidebarOpen, adminData }: HeaderAdminProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const notifWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
        notifWrapperRef.current && !notifWrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifData = await getNotifications();
        setNotifications(notifData);
        const unread = notifData.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userInfo");
      localStorage.removeItem("accountPageData");
      toast.success("Bạn đã đăng xuất thành công!");
      window.location.href = "/account";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất.");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    let content = `
      <p><b>Nội dung:</b> ${notif.message}</p>
      <p><b>Thời gian:</b> ${notif.createdAt.toLocaleString()}</p>
      <hr/>
    `;

    if (notif.source === "report" && notif.metadata) {
      content += `
        <p><b>Người báo cáo (userId):</b> ${notif.metadata.userId || "Không có"}</p>
        <p><b>Hoạt động (activityId):</b> ${notif.metadata.activityId || "Không có"}</p>
        <p><b>Lý do:</b> ${notif.metadata.reason || "Không có"}</p>
      `;
    } else if (notif.source === "support" && notif.metadata) {
      content += `
        <p><b>Họ tên:</b> ${notif.metadata.name || "Không có"}</p>
        <p><b>Số điện thoại:</b> ${notif.metadata.phone || "Không có"}</p>
        <p><b>Email:</b> ${notif.metadata.userEmail || "Không có"}</p>
        <p><b>Địa chỉ:</b> ${notif.metadata.address || "Không có"}</p>
        <p><b>Mô tả:</b> ${notif.metadata.description || "Không có"}</p>
      `;
    } else if (notif.source === "notification" && notif.metadata) {
      if (notif.metadata.company) {
        content += `<p><b>Doanh nghiệp:</b> ${notif.metadata.company}</p>`;
      }
      if (notif.metadata.userEmail) {
        content += `<p><b>Email người dùng:</b> ${notif.metadata.userEmail}</p>`;
      }
      if (notif.metadata.type) {
        content += `<p><b>Loại:</b> ${notif.metadata.type}</p>`;
      }
    }

    Swal.fire({
      title: "Chi tiết thông báo",
      html: content,
      confirmButtonText: "Đóng",
    });

    // Cập nhật trạng thái isRead = true
    try {
      let collectionName = "";
      if (notif.source === "notification") {
        collectionName = "notifications";
      } else if (notif.source === "report") {
        collectionName = "reports";
      } else if (notif.source === "support") {
        collectionName = "support_requests";
      }

      if (collectionName) {
        await updateDoc(doc(db, collectionName, notif.id), { isRead: true });

        // Cập nhật lại giao diện
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đã đọc:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {/* <FaBars /> */}
        </button>
        <div className={styles.logoWrapper}>
          <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className={styles.logoImage} />
        </div>
        <h1 className={styles.title}>Trung Tâm Quản Trị</h1>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.greeting}>Xin chào, {adminData.name}</span>
        <div className={styles.avatarWrapper} ref={wrapperRef}>
          <div className={styles.avatar} onClick={() => setShowDropdown(!showDropdown)}>
            {adminData.name.charAt(0).toUpperCase()}
          </div>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownInfo}>
                <p className={styles.dropdownName}>{adminData.name}</p>
                <p className={styles.dropdownEmail}>{adminData.email}</p>
              </div>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <FaSignOutAlt className={styles.dropdownIcon} /> Đăng xuất
              </button>
            </div>
          )}
        </div>

        <div className={styles.notificationWrapper} ref={notifWrapperRef}>
          <div className={styles.notificationIcon} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
            <FaBell className="text-white cursor-pointer" title="Thông báo" />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </div>

          {showNotifDropdown && (
            <div className={styles.notificationDropdown}>
              <p className={styles.dropdownTitle}>Thông báo</p>
              {notifications.length === 0 ? (
                <p className={styles.emptyText}>Không có thông báo nào.</p>
              ) : (
                <ul className={styles.notificationList}>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`${styles.notificationItem} ${!n.isRead ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <p className={styles.notificationMessage}>{n.message}</p>
                      <p className={styles.notificationTime}>{n.createdAt.toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
        </div>
        <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars />
        </button>
      </div>
    </header>
  );
}
