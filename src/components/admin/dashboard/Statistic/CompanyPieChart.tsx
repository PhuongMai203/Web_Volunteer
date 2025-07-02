"use client";
import { Pie } from "react-chartjs-2";
import "@/components/types/chartSetup";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const CompanyPieChart = () => {
  const labels = [
    "Thực phẩm",
    "Tiền mặt",
    "Y tế",
    "Vật dụng",
    "Nhà ở",
    "Quần áo",
    "Tại chỗ",
    "Khác",
  ];

  const [counts, setCounts] = useState<number[]>(Array(labels.length).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "featured_activities"));
        const countMap = Array(labels.length).fill(0);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const supportType = data.supportType;

          const index = labels.indexOf(supportType);
          if (index !== -1) {
            countMap[index]++;
          }
        });

        setCounts(countMap);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu featured_activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Doanh nghiệp tài trợ",
        data: counts,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 205, 86, 0.7)",
          "rgba(201, 203, 207, 0.7)",
        ],
        borderWidth: 1,
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
      {loading ? <p>Đang tải dữ liệu...</p> : <Pie options={options} data={chartData} />}
    </div>
  );
};

export default CompanyPieChart;
