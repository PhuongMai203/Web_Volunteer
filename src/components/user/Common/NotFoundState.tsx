import React from 'react';
import styles from '../../../styles/Campaigns/CampaignDetail.module.css';

export default function NotFoundState() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundIcon}>⚠️</div>
      <h2 className={styles.notFoundTitle}>Không tìm thấy chiến dịch</h2>
      <p className={styles.notFoundText}>Chiến dịch bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
    </div>
  );
}