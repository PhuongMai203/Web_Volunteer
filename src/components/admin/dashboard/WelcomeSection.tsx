'use client';
import styles from "@/styles/admin/WelcomeSection.module.css";

interface AdminData {
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

interface WelcomeSectionProps {
  adminData: AdminData;
}

export default function WelcomeSection({ adminData }: WelcomeSectionProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topSection}>
        <div>
          <h1 className={styles.heading}>
            Chào mừng trở lại, <span className={styles.highlight}>{adminData.name}</span>!
          </h1>
          <p className={styles.description}>Đây là trang tổng quan hệ thống quản trị. Bạn có thể quản lý toàn bộ hệ thống từ trang này.</p>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.manageButton}>Quản lý tài khoản</button>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <p className={styles.cardLabel}>TÀI KHOẢN</p>
          <p className={styles.cardValue}>{adminData.name}</p>
        </div>

        <div className={styles.infoCard}>
          <p className={styles.cardLabel}>EMAIL</p>
          <p className={styles.cardValue}>{adminData.email}</p>
        </div>

        <div className={styles.infoCard}>
          <p className={styles.cardLabel}>TRẠNG THÁI</p>
          <span className={`${styles.statusBadge} ${adminData.isApproved ? styles.approved : styles.pending}`}>
            {adminData.isApproved ? 'ĐÃ KÍCH HOẠT' : 'CHỜ DUYỆT'}
          </span>
        </div>

        <div className={styles.infoCard}>
          <p className={styles.cardLabel}>VAI TRÒ</p>
          <span className={styles.roleBadge}>
            {adminData.role === 'admin' ? 'QUẢN TRỊ VIÊN' : adminData.role.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
