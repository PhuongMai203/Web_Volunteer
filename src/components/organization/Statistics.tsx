"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import CampaignBarChart from "@/components/organization/statistics/CampaignBarChart";
import StatisticsOverview from "@/components/organization/statistics/StatisticsOverview";
import VolunteerStatisticsSection from "@/components/organization/statistics/VolunteerStatisticsSection";
import QualityStatisticsSection from "@/components/organization/statistics/QualityStatisticsSection";


export default function Statistics() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Đang kiểm tra đăng nhập...</p>;
  if (!user) return <p>Bạn chưa đăng nhập!</p>;

  return (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px", background:"#fdfce5" }}>
    <CampaignBarChart userId={user.uid} />
    <StatisticsOverview userId={user.uid} />
    <VolunteerStatisticsSection  />
    <QualityStatisticsSection />
  </div>
);

}
