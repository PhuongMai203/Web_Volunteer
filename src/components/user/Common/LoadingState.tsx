import React from 'react';
import styles from '../../../styles/Campaigns/CampaignDetail.module.css'; 

export default function LoadingState() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Đang tải thông tin chiến dịch...</p>
    </div>
  );
}