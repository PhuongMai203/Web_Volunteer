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
  // Tạo cấu trúc HTML mới với tone cam pastel
  let content = `
    <div class="pastel-notification">
      <div class="notification-header">
        <div class="notification-icon">📢</div>
        <h3>${notif.message}</h3>
      </div>
      
      <div class="notification-body">
        <div class="info-item">
          <span class="info-label">Thời gian:</span>
          <span class="info-value">${notif.createdAt.toLocaleString()}</span>
        </div>
  `;

  // Xử lý các loại thông báo khác nhau
  if (notif.source === "report" && notif.metadata) {
    content += `
      <div class="metadata-section">
        <h4>Thông tin báo cáo</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Người báo cáo:</span>
            <span class="info-value">${notif.metadata.userId || "Không có"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Hoạt động:</span>
            <span class="info-value">${notif.metadata.activityId || "Không có"}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">Lý do:</span>
            <span class="info-value">${notif.metadata.reason || "Không có"}</span>
          </div>
        </div>
      </div>
    `;
  } else if (notif.source === "support" && notif.metadata) {
    content += `
      <div class="metadata-section">
        <h4>Yêu cầu hỗ trợ</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Họ tên:</span>
            <span class="info-value">${notif.metadata.name || "Không có"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Điện thoại:</span>
            <span class="info-value">${notif.metadata.phone || "Không có"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${notif.metadata.userEmail || "Không có"}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">${notif.metadata.address || "Không có"}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">Mô tả:</span>
            <span class="info-value">${notif.metadata.description || "Không có"}</span>
          </div>
        </div>
      </div>
    `;
  } else if (notif.source === "notification" && notif.metadata) {
    content += `<div class="metadata-section"><h4>Thông tin bổ sung</h4><div class="info-grid">`;
    
    if (notif.metadata.company) {
      content += `
        <div class="info-item">
          <span class="info-label">Doanh nghiệp:</span>
          <span class="info-value">${notif.metadata.company}</span>
        </div>
      `;
    }
    if (notif.metadata.userEmail) {
      content += `
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">${notif.metadata.userEmail}</span>
        </div>
      `;
    }
    if (notif.metadata.type) {
      content += `
        <div class="info-item">
          <span class="info-label">Loại:</span>
          <span class="info-value">${notif.metadata.type}</span>
        </div>
      `;
    }
    
    content += `</div></div>`;
  }

  content += `</div></div>`; 

  // Thêm CSS trực tiếp cho giao diện
  const customCSS = `
    <style>
      .pastel-notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #5a3e36;
        max-width: 500px;
      }
      
      .notification-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ffd8b8;
        margin-bottom: 16px;
      }
      
      .notification-icon {
        background: #ffe8d6;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      
      .notification-header h3 {
        margin: 0;
        color: #e67e22;
        font-size: 1.2em;
      }
      
      .metadata-section {
        background: #fff5eb;
        border-radius: 10px;
        padding: 15px;
        margin-top: 20px;
        border-left: 3px solid #ffb677;
      }
      
      .metadata-section h4 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #d35400;
        font-size: 1.1em;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .info-item {
        display: flex;
        flex-direction: column;
      }
      
      .info-item.full-width {
        grid-column: span 2;
      }
      
      .info-label {
        font-weight: 600;
        color: #e67e22;
        font-size: 0.85em;
        margin-bottom: 4px;
      }
      
      .info-value {
        background: #ffeed9;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.95em;
      }
    </style>
  `;

  Swal.fire({
    title: "Chi tiết thông báo",
    html: customCSS + content,
    confirmButtonText: "Đóng",
    background: '#fffaf5',
    confirmButtonColor: '#ffb677',
    padding: '20px',
    customClass: {
      popup: 'pastel-notification-popup',
      title: 'pastel-notification-title',
      htmlContainer: 'pastel-notification-content'
    },
    width: '600px'
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
