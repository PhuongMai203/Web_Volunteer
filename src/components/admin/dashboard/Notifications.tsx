'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/notifications/NotificationsPage.module.css';
import { FaBusinessTime, FaExclamationTriangle, FaLifeRing } from 'react-icons/fa';
import { getNotifications, Notification } from "@/lib/firebase/getNotifications";
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notifData = await getNotifications();
        setNotifications(notifData);
        setUnreadCount(notifData.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
        toast.error('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (source: string) => {
    switch (source) {
      case "notification":
        return <FaBusinessTime className={styles.iconBlue} />;
      case "report":
        return <FaExclamationTriangle className={styles.iconRed} />;
      case "support":
        return <FaLifeRing className={styles.iconOrange} />;
      default:
        return <FaBusinessTime />;
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Thông báo ({unreadCount} chưa đọc)</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : notifications.length === 0 ? (
        <p>Không có thông báo nào.</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((item) => (
            <li key={item.id} className={`${styles.item} ${!item.isRead ? styles.unread : ''}`}>
              <div className={styles.iconWrapper}>
                {renderIcon(item.source)}
              </div>
              <div className={styles.content}>
                <p className={styles.message}>{item.message}</p>
                <p className={styles.time}>
                  {format(item.createdAt, 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>

              {/* Điều hướng theo source */}
              {item.source === 'report' && item.metadata?.relatedId && (
                <Link href={`/campaign/${item.metadata.relatedId}`} className={styles.link}>
                  Xem chiến dịch
                </Link>
              )}
              {item.source === 'notification' && item.metadata?.type === 'business_verification' && item.metadata?.relatedId && (
                <Link href={`/admin/business/${item.metadata.relatedId}`} className={styles.link}>
                  Xem doanh nghiệp
                </Link>
              )}
              {item.source === 'support' && item.metadata?.userId && (
                <Link href={`/admin/support-requests?highlight=${item.metadata.userId}`} className={styles.link}>
                  Xem yêu cầu
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
