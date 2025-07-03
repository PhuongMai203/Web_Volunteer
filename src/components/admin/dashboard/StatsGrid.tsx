'use client';

import styles from "@/styles/admin/StatsGrid.module.css";
import { ReactNode } from "react";

interface StatItem {
  id: string;
  value: number | string;
  title: string;
  icon: ReactNode;
  color: string;
}

interface StatsGridProps {
  statsData: StatItem[];
}

export default function StatsGrid({ statsData }: StatsGridProps) {
  return (
    <div className={styles.gridWrapper}>
      {statsData.map((stat) => (
        <div key={stat.id} className={styles.statCard}>
          <div className={styles.iconWrapper}>
            <div className={`${styles.iconCircle} ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <div className={styles.statValue}>{stat.value}</div>
          <p className={styles.statTitle}>{stat.title}</p>
        </div>
      ))}
    </div>
  );
}
