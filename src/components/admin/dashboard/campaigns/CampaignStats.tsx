"use client";

import { useEffect, useState } from "react";
import { ChartBarIcon, CalendarIcon, GroupIcon } from "lucide-react";
import StatCard from "./StatCard";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

interface Activity {
  startDate: Timestamp | string;
  endDate: Timestamp | string;
  participantCount: number;
}

export default function CampaignStats() {
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [volunteers, setVolunteers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const snapshot = await getDocs(collection(db, "featured_activities"));
      const now = new Date();
      let totalCount = 0;
      let activeCount = 0;
      let upcomingCount = 0;
      let volunteerCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Activity;
        totalCount++;

        // Xử lý trường hợp ngày là Timestamp hoặc string
        let startDate: Date;
        let endDate: Date;

        if (typeof data.startDate === "string") {
          startDate = new Date(data.startDate);
        } else {
          startDate = data.startDate.toDate();
        }

        if (typeof data.endDate === "string") {
          endDate = new Date(data.endDate);
        } else {
          endDate = data.endDate.toDate();
        }

        // So sánh ngày
        if (startDate > now) {
          upcomingCount++;
        } else if (startDate <= now && endDate >= now) {
          activeCount++;
        }

        volunteerCount += data.participantCount || 0;
      });

      setTotal(totalCount);
      setActive(activeCount);
      setUpcoming(upcomingCount);
      setVolunteers(volunteerCount);
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">

      <StatCard
        title="Tổng Chiến Dịch"
        value={total}
        icon={<ChartBarIcon className="h-8 w-8" />}
        color="bg-orange-500"
      />
      <StatCard
        title="Đang Hoạt Động"
        value={active}
        icon={<CalendarIcon className="h-8 w-8" />}
        color="bg-green-500"
      />
      <StatCard
        title="Sắp Diễn Ra"
        value={upcoming}
        icon={<CalendarIcon className="h-8 w-8" />}
        color="bg-blue-500"
      />
      <StatCard
        title="Tình Nguyện Viên"
        value={volunteers}
        icon={<GroupIcon className="h-8 w-8" />}
        color="bg-purple-500"
      />
    </div>
  );
}
