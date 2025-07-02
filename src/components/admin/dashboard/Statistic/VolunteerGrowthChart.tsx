"use client";
import { Line } from "react-chartjs-2";
import "@/components/types/chartSetup";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const VolunteerGrowthChart = () => {
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const monthlyCounts = Array(12).fill(0); // 12 tháng

        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdDate = new Date(data.createdAt.seconds * 1000);
            const month = createdDate.getMonth(); // 0 - 11
            monthlyCounts[month]++;
          }
        });

        setMonthlyData(monthlyCounts);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const chartData = {
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Người dùng mới",
        data: monthlyData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return (
    <div className="h-80 flex items-center justify-center">
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <Line options={options} data={chartData} />
      )}
    </div>
  );
};

export default VolunteerGrowthChart;
