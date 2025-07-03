"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "../../../styles/organization/CampaignBarChart.module.css";

const categories = ["Tạo mới", "Hoàn thành", "Tình nguyện viên", "Ủng hộ (triệu đồng)"];
const colors = ["#007bff", "#28a745", "#fd7e14", "#6f42c1"];

interface ChartData {
  month: string;
  created: number;
  completed: number;
  volunteers: number;
  donation: number;
}

export default function CampaignBarChart({ userId }: { userId: string | null }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      loadChartData();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);

      const campaignsSnapshot = await getDocs(
        query(collection(db, "featured_activities"), where("userId", "==", userId))
      );

      const paymentsSnapshot = await getDocs(
        query(collection(db, "payments"), where("campaignCreatorId", "==", userId))
      );

      const campaignDonations: Record<string, number> = {};
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = data.amount ?? 0;
        const campaignId = data.campaignId;
        if (campaignId) {
          campaignDonations[campaignId] = (campaignDonations[campaignId] ?? 0) + amount;
        }
      });

      const stats: Record<string, ChartData> = {};
      const now = new Date();

      campaignsSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdDate = data.createdAt?.toDate?.() || data.createdDate?.toDate?.();
        const endDate = data.endDate?.toDate?.();
        if (!createdDate) return;

        const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
        const campaignId = doc.id;
        const participants = data.participantCount ?? 0;
        const donation = campaignDonations[campaignId] ?? 0;

        // Thống kê "Tạo mới" & số tình nguyện viên
        if (!stats[createdKey]) {
          stats[createdKey] = { month: createdKey, created: 0, completed: 0, volunteers: 0, donation: 0 };
        }
        stats[createdKey].created += 1;
        stats[createdKey].volunteers += participants;

        // Thống kê "Hoàn thành" & tiền ủng hộ nếu endDate hợp lệ
        if (endDate && endDate < now) {
          const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}`;
          if (!stats[endKey]) {
            stats[endKey] = { month: endKey, created: 0, completed: 0, volunteers: 0, donation: 0 };
          }
          stats[endKey].completed += 1;
          stats[endKey].donation += donation;
        }
      });

      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
      setAvailableYears(years);
      setSelectedYear(currentYear);

      const sortedData = Object.values(stats).sort((a, b) => a.month.localeCompare(b.month));
      setChartData(sortedData);
      setIsLoading(false);
    } catch (e) {
      console.error("Lỗi load dữ liệu:", e);
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    const filtered = chartData.filter(d => d.month.startsWith(selectedYear.toString()));
    const dataWithFullMonths: ChartData[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${selectedYear}-${String(m).padStart(2, "0")}`;
      const found = filtered.find(d => d.month === monthKey);
      dataWithFullMonths.push(found ?? {
        month: monthKey,
        created: 0,
        completed: 0,
        volunteers: 0,
        donation: 0,
      });
    }
    return dataWithFullMonths;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return value.toFixed(0);
  };

  if (isLoading) return <p>Đang tải biểu đồ...</p>;
  if (!chartData.length) return <p>Không có dữ liệu</p>;

  return (
    <div className={styles.chartWrapper}>
      <h3 className={styles.title}>Thống kê chiến dịch theo tháng</h3>

      {availableYears.length > 0 && (
        <select
          className={styles.filterSelect}
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={getFilteredData()} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={(m) => m.split("-")[1]} />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(v) => formatYAxis(Number(v))} />
          <Legend />
          <Bar dataKey="created" fill={colors[0]} name={categories[0]} />
          <Bar dataKey="completed" fill={colors[1]} name={categories[1]} />
          <Bar dataKey="volunteers" fill={colors[2]} name={categories[2]} />
          <Bar dataKey="donation" fill={colors[3]} name={categories[3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
