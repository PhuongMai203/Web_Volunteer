import React from "react";
import styles from "@/styles/admin/UserManagement.module.css";
import { FaUser, FaUserCheck, FaUserTimes, FaUserTie } from "react-icons/fa";

interface StatsOverviewProps {
  readonly total: number;
  readonly active: number;
  readonly inactive: number;
  readonly admin: number;
}

export default function StatsOverview({ total = 0, active = 0, inactive = 0, admin = 0 }: StatsOverviewProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={`${styles.statCard} ${styles.statCardTotal}`}>
        <div className={styles.statContent}>
          <div className={styles.statIcon}><FaUser /></div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Tổng người dùng</h3>
            <p className={styles.statValue}>{total}</p>
          </div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardActive}`}>
        <div className={styles.statContent}>
          <div className={styles.statIcon}><FaUserCheck /></div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Đang hoạt động</h3>
            <p className={styles.statValue}>{active}</p>
          </div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardInactive}`}>
        <div className={styles.statContent}>
          <div className={styles.statIcon}><FaUserTimes /></div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Đã khóa</h3>
            <p className={styles.statValue}>{inactive}</p>
          </div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statCardAdmin}`}>
        <div className={styles.statContent}>
          <div className={styles.statIcon}><FaUserTie /></div>
          <div className={styles.statInfo}>
            <h3 className={styles.statTitle}>Quản trị viên</h3>
            <p className={styles.statValue}>{admin}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
