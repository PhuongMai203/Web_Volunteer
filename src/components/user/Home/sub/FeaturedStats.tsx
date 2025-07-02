"use client";

import React, { useEffect, useState } from "react";
import { getUserStats } from "@/lib/firebase/getUsers";
import { getFeaturedStats } from "@/lib/firebase/getFeaturedActivities";

export default function FeaturedStats() {
  const [stats, setStats] = useState({
    volunteers: 0,
    organizations: 0,
    campaigns: 0,
    cities: 0,
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
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
    };

    fetchStats();
  }, []);

  const displayStats = [
    { label: "Tình nguyện viên", value: stats.volunteers, icon: "🧑‍🤝‍🧑" },
    { label: "Chiến dịch", value: stats.campaigns, icon: "🎯" },
    { label: "Doanh nghiệp", value: stats.organizations, icon: "🏢" },
    { label: "Thành phố", value: stats.cities, icon: "🌆" },
  ];

  if (!hasMounted) {
    return null;
  }

  return (
    <section className="bg-orange-50 py-12 px-6" data-aos="fade-up">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-10">
          📊 Số liệu hoạt động nổi bật
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {displayStats.map((item, index) => (
            <div
              key={item.label}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
              data-aos="zoom-in"
              data-aos-delay={index * 150}
            >
              <div className="text-4xl mb-2">{item.icon}</div>
              <p className="text-3xl font-bold text-orange-500">
                {item.value.toLocaleString("vi-VN")}
              </p>
              <p className="text-sm text-gray-700 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
