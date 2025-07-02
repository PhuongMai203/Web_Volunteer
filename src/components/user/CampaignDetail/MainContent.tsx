import React, { useEffect, useState } from 'react';
import styles from '../../../styles/Campaigns/CampaignDetail.module.css';
import { CampaignDetailClient } from '../../types/campaign';

interface CampaignDetailMainContentProps {
  campaign: CampaignDetailClient;
}

export default function CampaignDetailMainContent({ campaign }: CampaignDetailMainContentProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <div className={styles.mainContent}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📝</span>
          Mô tả chiến dịch
        </h2>
        <p className={styles.description}>{campaign.description}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>ℹ️</span>
          Thông tin chi tiết
        </h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>🏷️</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Danh mục</div>
              <div className={styles.detailValue}>{campaign.category}</div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>🤝</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Hình thức hỗ trợ</div>
              <div className={styles.detailValue}>{campaign.supportType}</div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>📦</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Hình thức tiếp nhận</div>
              <div className={styles.detailValue}>{campaign.receivingMethod}</div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>📞</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Liên hệ</div>
              <div className={styles.detailValue}>{campaign.phoneNumber}</div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>👥</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Tình nguyện viên</div>
              <div className={styles.detailValue}>
                {campaign.participantCount}/{campaign.maxVolunteerCount} người
              </div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>💰</div>
            <div className={styles.detailContent}>
              <div className={styles.detailLabel}>Tổng quyên góp</div>
              <div className={styles.detailValue}>
                {campaign.totalDonationAmount.toLocaleString()} ₫
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
