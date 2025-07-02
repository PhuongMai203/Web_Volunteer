'use client';

import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "@/styles/admin/RecentActivity.module.css";

interface Activity {
  id: string;
  action: string;
  user: string;
  createdAt: Timestamp;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Activity[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Activity, "id">),
        }));
        setActivities(data);
      } catch (error) {
        console.error("Lỗi khi lấy hoạt động gần đây:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTime = (timestamp: Timestamp) => {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: vi });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hoạt Động Gần Đây</h3>
        <button className={styles.viewAllBtn}>Xem tất cả</button>
      </div>

      {loading ? (
        <p className="p-4">Đang tải dữ liệu...</p>
      ) : (
        <div className={styles.activityList}>
          {activities.length === 0 ? (
            <p className="p-4">Chưa có hoạt động nào.</p>
          ) : (
            activities.map(activity => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.iconWrapper}>
                  <FaUser />
                </div>
                <div>
                  <p className={styles.action}>{activity.action}</p>
                  <p className={styles.detail}>
                    Bởi Admin • {formatTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
