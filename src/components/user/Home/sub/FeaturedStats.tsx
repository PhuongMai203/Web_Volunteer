"use client";

import React, { useEffect, useState } from "react";
import { getUserStats } from "@/lib/firebase/getUsers";
import { getFeaturedStats } from "@/lib/firebase/getFeaturedActivities";
import styles from "@/styles/Home/FeaturedStats.module.css";

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
    <section className={styles.section} data-aos="fade-up">
      <div className={styles.container}>
        <h2 className={styles.heading}>📊 Số liệu hoạt động nổi bật</h2>
        <div className={styles.grid}>
          {displayStats.map((item, index) => (
            <div
              key={item.label}
              className={styles.statCard}
              data-aos="zoom-in"
              data-aos-delay={index * 150}
            >
              <div className={styles.statIcon}>{item.icon}</div>
              <p className={styles.statValue}>
                {item.value.toLocaleString("vi-VN")}
              </p>
              <p className={styles.statLabel}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
