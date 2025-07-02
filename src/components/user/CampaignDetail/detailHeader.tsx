import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../../styles/Campaigns/CampaignDetail.module.css';
import { CampaignDetailClient } from '../../types/campaign';
import { formatDate } from '../Common/utils';
import { handleReport } from "../../../utils/reportUtils";

interface CampaignDetailHeaderProps {
  campaign: CampaignDetailClient;
}

const getUrgencyClass = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case 'cao':
      return styles.highUrgency;
    case 'trung bình':
      return styles.mediumUrgency;
    case 'thấp':
      return styles.lowUrgency;
    default:
      return '';
  }
};

export default function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title || 'Chiến dịch từ thiện',
        text: 'Hãy cùng tham gia chiến dịch ý nghĩa này!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào clipboard!');
    }
  };

  if (!hasMounted) return null;

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroImageContainer}>
        {!imageLoaded && !imgError && (
          <div className={styles.imageSkeleton}></div>
        )}
        <Image
          src={imgError ? "/images/default_campaign.jpg" : (campaign.imageUrl || "/images/default_campaign.jpg")}
          alt={campaign.title}
          fill
          quality={85}
          priority
          className={`${styles.heroImage} ${imageLoaded ? styles.loaded : ''}`}
          onLoadingComplete={() => setImageLoaded(true)}
          onError={() => {
            setImgError(true);
            setImageLoaded(true);
          }}
          style={{ objectFit: "cover" }}
        />

        <div className={styles.floatingActions}>
          <button
            className={`${styles.actionButton} ${styles.shareButton}`}
            onClick={handleShare}
            aria-label="Chia sẻ chiến dịch"
          >
            <svg className={styles.buttonIcon} viewBox="0 0 24 24">
              <path d="M18 16c-.8 0-1.5.3-2 .9l-7-4.1c.1-.3.1-.5.1-.8s0-.5-.1-.8l7-4.1c.5.6 1.2.9 2 .9 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .5.1.8l-7 4.1c-.5-.6-1.2-.9-2-.9-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.9l7 4.1c-.1.3-.1.5-.1.8 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z" />
            </svg>
            <span>Chia sẻ</span>
          </button>

          <button
            className={`${styles.actionButton} ${styles.reportButton}`}
            onClick={() => handleReport(campaign.id)}
            aria-label="Báo cáo chiến dịch"
          >
            <svg className={styles.buttonIcon} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Báo cáo</span>
          </button>

        </div>

        <div className={styles.imageOverlay}></div>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.categoryTag}>
          {campaign.category}
        </div>

        <h1 className={styles.title}>{campaign.title}</h1>

        <div className={`${styles.urgencyTag} ${getUrgencyClass(campaign.urgency)}`}>
          <span className={styles.urgencyIcon}>!</span>
          Mức độ: {campaign.urgency}
        </div>

        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📅</span>
            <span>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📍</span>
            <span>{campaign.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
