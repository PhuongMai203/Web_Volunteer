"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "../../../styles/organization/VolunteerStatisticsSection.module.css";

interface VolunteerStats {
  avgVolunteers: number;
  actualAttendanceRate: number;
  birthYears: number[];
  locations: string[];
  mostActiveVolunteer: string;
  comebackRate: number;
}

export default function VolunteerStatisticsSection() {
  const [user, loading] = useAuthState(auth);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) fetchVolunteerStats();
  }, [user]);

  const fetchVolunteerStats = async () => {
    try {
      setIsLoading(true);
      const userId = user?.uid;
      const userEmail = user?.email;
      const now = new Date();

      const activitiesSnapshot = await getDocs(
        query(collection(db, "featured_activities"), where("userId", "==", userId))
      );

      const completedActivities = activitiesSnapshot.docs.filter((doc) => {
        const endDate = doc.data().endDate?.toDate?.();
        return endDate && endDate < now;
      });

      let totalCampaigns = completedActivities.length;
      let totalParticipants = 0;
      let totalRegistrations = 0;
      let totalAttendance = 0;
      let highRatingCount = 0;

      const birthYears: number[] = [];
      const volunteerCounts: Record<string, number> = {};
      const locations: string[] = [];

      for (const campaign of completedActivities) {
        const campaignId = campaign.id;
        const data = campaign.data();
        totalParticipants += data.participantCount ?? 0;

        const registrationsSnapshot = await getDocs(
          query(collection(db, "campaign_registrations"), where("campaignId", "==", campaignId))
        );

        registrationsSnapshot.forEach((doc) => {
          totalRegistrations++;
          const regData = doc.data();

          if (regData.attendanceStatus === "Có mặt") totalAttendance++;
          if (regData.email_campaign === userEmail) {
            const year = parseInt(regData.birthYear);
            if (!isNaN(year)) birthYears.push(year);
          }

          const name = regData.name ?? "";
          if (name) volunteerCounts[name] = (volunteerCounts[name] ?? 0) + 1;
        });

        const feedbackSnapshot = await getDocs(
          query(collection(db, "campaign_feedback"), where("campaignId", "==", campaignId))
        );

        feedbackSnapshot.forEach((doc) => {
          const rating = doc.data().rating ?? 0;
          if (rating >= 4) highRatingCount++;
        });
      }

      const userRegistrationsSnapshot = await getDocs(
        query(collection(db, "campaign_registrations"), where("email_campaign", "==", userEmail))
      );

      userRegistrationsSnapshot.forEach((doc) => {
        const loc = doc.data().location;
        if (loc) locations.push(loc);
      });

      const avgVolunteers = totalCampaigns ? totalParticipants / totalCampaigns : 0;
      const actualAttendanceRate = totalRegistrations ? totalAttendance / totalRegistrations : 0;
      const mostActiveVolunteer = Object.entries(volunteerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Không có dữ liệu";
      const comebackRate = totalRegistrations ? highRatingCount / totalRegistrations : 0;

      setStats({
        avgVolunteers,
        actualAttendanceRate,
        birthYears,
        locations,
        mostActiveVolunteer,
        comebackRate,
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê tình nguyện viên:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageAge = (years: number[]) => {
    const currentYear = new Date().getFullYear();
    const totalAge = years.reduce((acc, y) => acc + (currentYear - y), 0);
    return years.length ? Math.round(totalAge / years.length) : 0;
  };

  const getMostCommonLocation = (locs: string[]) => {
    const count: Record<string, number> = {};
    locs.forEach((l) => (count[l] = (count[l] ?? 0) + 1));
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || "Không có dữ liệu";
  };

  if (loading || isLoading) return <p>Đang tải thống kê...</p>;
  if (!stats) return <p>Không có dữ liệu</p>;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Thống kê tình nguyện viên</h3>
      <div className={styles.statRow}><span>Số tình nguyện viên trung bình/chiến dịch:</span><strong>{stats.avgVolunteers.toFixed(1)}</strong></div>
      <div className={styles.statRow}><span>Tỷ lệ điểm danh thực tế:</span><strong>{(stats.actualAttendanceRate * 100).toFixed(1)}%</strong></div>
      <div className={styles.statRow}><span>Tuổi trung bình:</span><strong>{stats.birthYears.length ? calculateAverageAge(stats.birthYears) : "Không có dữ liệu"}</strong></div>
      <div className={styles.statRow}><span>Khu vực phổ biến:</span><strong>{stats.locations.length ? getMostCommonLocation(stats.locations) : "Không có dữ liệu"}</strong></div>
      <div className={styles.statRow}><span>Tình nguyện viên tích cực nhất:</span><strong>{stats.mostActiveVolunteer}</strong></div>
      <div className={styles.statRow}><span>Tỷ lệ quay lại:</span><strong>{(stats.comebackRate * 100).toFixed(1)}%</strong></div>
    </div>
  );
}
