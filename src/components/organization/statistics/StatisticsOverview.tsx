"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import styles from "../../../styles/organization/StatisticsOverview.module.css";

interface Statistics {
  totalEvents: number;
  fillRate: number;
  popularCategory: string;
}

export default function StatisticsOverview({ userId }: { userId: string | null }) {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) fetchStatistics();
  }, [userId]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);

      const now = new Date();
      const q = query(collection(db, "featured_activities"), where("userId", "==", userId));
      const snapshot = await getDocs(q);

      let totalEvents = snapshot.size;
      let totalFillRate = 0;
      let completedEventCount = 0;

      const categoryCount: Record<string, number> = {};
      const categoryFillRates: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const endDate = data.endDate?.toDate?.();
        const participantCount = data.participantCount ?? 0;
        const maxVolunteerCount = data.maxVolunteerCount ?? 1;
        const category = data.category ?? "Khác";

        categoryCount[category] = (categoryCount[category] ?? 0) + 1;

        if (endDate && endDate < now) {
          const fillRate = participantCount / maxVolunteerCount;
          totalFillRate += fillRate;
          completedEventCount++;
          categoryFillRates[category] = (categoryFillRates[category] ?? 0) + fillRate;
        }
      });

      const fillRate = completedEventCount === 0 ? 0 : totalFillRate / completedEventCount;

      let popularCategory = "Không xác định";
      let maxScore = -1;
      for (const category in categoryCount) {
        const avgRate = (categoryFillRates[category] ?? 0) / categoryCount[category];
        const score = categoryCount[category] * avgRate;
        if (score > maxScore) {
          maxScore = score;
          popularCategory = category;
        }
      }

      setStats({
        totalEvents,
        fillRate,
        popularCategory,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>Đang tải thống kê...</p>;
  if (!stats) return <p>Không có dữ liệu</p>;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Thống kê tổng quan chiến dịch</h3>
      <div className={styles.statRow}>
        <span>Tổng chiến dịch:</span>
        <strong>{stats.totalEvents}</strong>
      </div>
      <div className={styles.statRow}>
        <span>Tỷ lệ lấp đầy:</span>
        <strong>{(stats.fillRate * 100).toFixed(1)}%</strong>
      </div>
      <div className={styles.statRow}>
        <span>Danh mục phổ biến:</span>
        <strong>{stats.popularCategory}</strong>
      </div>
    </div>
  );
}
