"use client";
import { useEffect, useState } from "react";
import { fetchNotifications, markAllAsRead } from "@/lib/firebase/notificationService";
import { useRouter } from "next/navigation";
import styles from "@/styles/organization/NotificationPopup.module.css";
import { NotificationData } from "../../types/notification";

export default function NotificationPopup({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
    };
    loadData();
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(notifications);
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h3>Thông báo ({notifications.length})</h3>
        <button onClick={handleMarkAllAsRead}>Đánh dấu đã đọc</button>
      </div>

      {notifications.length === 0 ? (
        <p>Không có thông báo.</p>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ""}`}
            
            >
              <strong>
                {n.type === "feedback"
                  ? `Đánh giá mới từ ${n.userName}`
                  : `Nhận được ${n.amount}₫ từ ${n.userName}`}
              </strong>
              <p>
                {n.type === "feedback" ? n.comment : `Chiến dịch: ${n.campaignTitle}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
