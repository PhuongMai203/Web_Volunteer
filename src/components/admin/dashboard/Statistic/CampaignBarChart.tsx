"use client";
import { Bar } from "react-chartjs-2";
import "@/components/types/chartSetup";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const CampaignBarChart = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [counts, setCounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh mục từ system_settings
        const settingsDoc = await getDoc(doc(db, "system_settings",  "main"));
        
        let categories: { id: number; name: string }[] = [];

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          console.log("Dữ liệu system_settings:", data);
          if (Array.isArray(data.categories)) {
            categories = data.categories;
          }
        } 
        const labelNames = categories.map((cat) => cat.name);

        const countMap = Array(labelNames.length).fill(0);

        // Lấy danh sách chiến dịch
        const activitiesSnapshot = await getDocs(collection(db, "featured_activities"));

        console.log("Tổng số document trong featured_activities:", activitiesSnapshot.size);

        activitiesSnapshot.forEach((doc) => {
          const activity = doc.data();
          console.log("Chiến dịch:", activity);

          const activityCategory = activity.category;
          const index = labelNames.indexOf(activityCategory);
          if (index !== -1) {
            countMap[index]++;
          }
        });

        console.log("Số lượng từng danh mục:", countMap);

        setLabels(labelNames);
        setCounts(countMap);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu biểu đồ chiến dịch:", error);
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
        label: "Số lượng chiến dịch",
        data: counts,
        backgroundColor: "rgba(54, 162, 235, 0.8)",
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
      {loading ? <p>Đang tải dữ liệu...</p> : <Bar options={options} data={chartData} />}
    </div>
  );
};

export default CampaignBarChart;
