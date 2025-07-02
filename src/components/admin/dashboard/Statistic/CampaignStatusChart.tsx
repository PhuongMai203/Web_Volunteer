"use client";
import { Bar } from "react-chartjs-2";
import "@/components/types/chartSetup";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

const CampaignStatusChart = () => {
  const [statusCounts, setStatusCounts] = useState<number[]>([0, 0, 0]); // [Đang diễn ra, Sắp diễn ra, Đã kết thúc]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "featured_activities"));
        console.log("Tổng số document:", snapshot.size);

        let ongoing = 0;
        let upcoming = 0;
        let ended = 0;

        const now = new Date();

        snapshot.forEach((doc) => {
          const activity = doc.data();
          const startDate = activity.startDate?.toDate?.();
          const endDate = activity.endDate?.toDate?.();

          if (startDate && endDate) {
            if (startDate > now) {
              upcoming++;
            } else if (startDate <= now && endDate > now) {
              ongoing++;
            } else if (endDate <= now) {
              ended++;
            }
          }
        });

        console.log(`Sắp diễn ra: ${upcoming}, Đang diễn ra: ${ongoing}, Đã kết thúc: ${ended}`);

        setStatusCounts([ongoing, upcoming, ended]);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu trạng thái chiến dịch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: ["Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"],
    datasets: [
      {
        label: "Số lượng",
        data: statusCounts,
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",   // Đang diễn ra
          "rgba(255, 206, 86, 0.8)",   // Sắp diễn ra
          "rgba(255, 99, 132, 0.8)",   // Đã kết thúc
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-80 flex items-center justify-center">
      {loading ? <p>Đang tải dữ liệu...</p> : <Bar options={options} data={data} />}
    </div>
  );
};

export default CampaignStatusChart;
