"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from "../../../styles/organization/QualityStatisticsSection.module.css";

interface QualityStats {
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
  goodVolunteerRatio: number;
}

export default function QualityStatisticsSection() {
  const [user, loading] = useAuthState(auth);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) fetchQualityStats();
  }, [user]);

  const fetchQualityStats = async () => {
    try {
      setIsLoading(true);
      const userId = user?.uid;
      const userEmail = user?.email;

      let totalRating = 0;
      let ratingCount = 0;
      let positiveCount = 0;
      let negativeCount = 0;

      const feedbackSnapshot = await getDocs(
        query(collection(db, "campaign_feedback"), where("campaignCreatorId", "==", userId))
      );

      feedbackSnapshot.forEach((doc) => {
        const rating = doc.data().rating ?? 0;
        totalRating += rating;
        ratingCount++;
        if (rating >= 4) positiveCount++;
        else negativeCount++;
      });

      const averageRating = ratingCount ? totalRating / ratingCount : 0;

      const registrationsSnapshot = await getDocs(
        query(collection(db, "campaign_registrations"), where("email_campaign", "==", userEmail))
      );

      const totalRegs = registrationsSnapshot.size;
      const attendedCount = registrationsSnapshot.docs.filter(
        (doc) => doc.data().attendanceStatus === "Có mặt"
      ).length;

      const goodVolunteerRatio = totalRegs ? attendedCount / totalRegs : 0;

      setStats({
        averageRating,
        positiveFeedback: positiveCount,
        negativeFeedback: negativeCount,
        goodVolunteerRatio,
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê chất lượng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return <p>Đang tải thống kê...</p>;
  if (!stats) return <p>Không có dữ liệu</p>;

  const pieData = [
    { name: "Phản hồi tích cực", value: stats.positiveFeedback, color: "#4CAF50" },
    { name: "Phản hồi tiêu cực", value: stats.negativeFeedback, color: "#F44336" },
  ];

  const barData = [
    { name: "Đánh giá trung bình", value: stats.averageRating * 20 },
    { name: "Tỷ lệ tình nguyện viên tốt", value: stats.goodVolunteerRatio * 100 },
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Thống kê chất lượng</h3>

      <p className={styles.sectionTitle}>Tỷ lệ phản hồi</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={40}
            outerRadius={70}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <p className={styles.sectionTitle}>Chất lượng đóng góp</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="value" fill="#2196F3" />
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.statRow}>
        <span>Đánh giá trung bình:</span>
        <strong>{stats.averageRating.toFixed(1)} / 5</strong>
      </div>
      <div className={styles.statRow}>
        <span>Tỷ lệ tình nguyện viên tốt:</span>
        <strong>{(stats.goodVolunteerRatio * 100).toFixed(1)}%</strong>
      </div>
    </div>
  );
}
