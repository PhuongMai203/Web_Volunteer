"use client";

import { useEffect, useState } from "react";
import VolunteerGrowthChart from "./VolunteerGrowthChart";
import CompanyPieChart from "./CompanyPieChart";
import CampaignBarChart from "./CampaignBarChart";
import CampaignStatusChart from "./CampaignStatusChart";
import StatCard from "./StatCard";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const StatisticsPage = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeCampaigns, setActiveCampaigns] = useState<number>(0);
  const [totalVolunteerHours, setTotalVolunteerHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        // Đếm người dùng trừ admin
        const usersSnapshot = await getDocs(collection(db, "users"));
        let userCount = 0;
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          if (user.role !== "admin") {
            userCount++;
          }
        });
        setTotalUsers(userCount);

        // Đếm chiến dịch đang hoạt động
        const activitiesSnapshot = await getDocs(collection(db, "featured_activities"));
        const now = new Date();
        let activeCount = 0;
        let totalHours = 0;

        activitiesSnapshot.forEach((doc) => {
          const activity = doc.data();
          const startDate = activity.startDate?.toDate?.();
          const endDate = activity.endDate?.toDate?.();

          if (endDate && endDate > now) {
            activeCount++;
          }

          if (startDate && endDate && endDate > startDate) {
            const diffMs = endDate.getTime() - startDate.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            totalHours += diffHours;
          }
        });

        setActiveCampaigns(activeCount);
        setTotalVolunteerHours(totalHours);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ background: 'rgb(255 251 235)' }}>
      <h1 className="text-[28px] font-bold text-center mb-8 text-[#c05621]" >
        Bảng Thống Kê Hệ Thống
      </h1>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#c05621]"  >
            Tăng trưởng người dùng
          </h2>
          <div className="h-80">
            <VolunteerGrowthChart />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#c05621]">
            Phương thức hỗ trợ
          </h2>
          <div className="h-80">
            <CompanyPieChart />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#c05621]">
            Loại hình chiến dịch
          </h2>
          <div className="h-80">
            <CampaignBarChart />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#c05621]">
            Trạng thái chiến dịch
          </h2>
          <div className="h-80">
            <CampaignStatusChart />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#c05621]">
          Tổng quan hệ thống
        </h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard title="Tổng tình nguyện viên" value={totalUsers.toString()} />
            <StatCard title="Chiến dịch đang hoạt động" value={activeCampaigns.toString()} />
            <StatCard title="Tổng giờ tình nguyện" value={totalVolunteerHours.toLocaleString()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
