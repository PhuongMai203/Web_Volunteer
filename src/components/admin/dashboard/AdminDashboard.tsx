'use client';
import { useEffect, useState } from "react";
import { FaUserFriends, FaBuilding, FaFlag, FaMapMarkerAlt } from 'react-icons/fa';
import { getUserStats } from "@/lib/firebase/getUsers";
import { getFeaturedStats } from "@/lib/firebase/getFeaturedActivities";
import WelcomeSection from "./WelcomeSection";
import StatsGrid from "./StatsGrid";
import RecentActivity from "../dashboard/RecentActivity";
import styles from "@/styles/admin/AdminDashboard.module.css";
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    campaigns: 0,
    cities: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, featuredStats] = await Promise.all([
          getUserStats(),
          getFeaturedStats(),
        ]);

        setStats({
          volunteers: userStats.volunteers,
          organizations: userStats.organizations,
          campaigns: featuredStats.campaigns,
          cities: featuredStats.cities,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };

    fetchStats();
  }, []);

    const displayStats = [
      { id: "1", title: "Tình Nguyện Viên", value: stats.volunteers, icon: <FaUserFriends />, color: "text-orange-500" },
      { id: "2", title: "Doanh Nghiệp", value: stats.organizations, icon: <FaBuilding />, color: "text-amber-600" },
      { id: "3", title: "Chiến Dịch", value: stats.campaigns, icon: <FaFlag />, color: "text-green-500" },
      { id: "4", title: "Thành Phố", value: stats.cities, icon: <FaMapMarkerAlt />, color: "text-red-500" },
    ];

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Bảng Điều Khiển Quản Trị</h2>
        <p className={styles.pageSubTitle}>Quản lý hệ thống và theo dõi hoạt động</p>
      </div>
      <WelcomeSection adminData={{
        email: "admin1@gmail.com",
        name: "admin1",
        role: "admin",
        isApproved: true,
      }} />
      <StatsGrid statsData={displayStats} />
      <RecentActivity />
    </>
  );
}
