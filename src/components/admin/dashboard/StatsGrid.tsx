'use client';

import styles from "@/styles/admin/StatsGrid.module.css";

export default function StatsGrid({ statsData }) {
  return (
    <div className={styles.gridWrapper}>
      {statsData.map(stat => (
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
