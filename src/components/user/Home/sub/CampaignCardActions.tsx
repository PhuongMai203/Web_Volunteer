"use client";

import { useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import styles from "../../../../styles/Home/sub/FeaturedCampaigns.module.css";
import { handleReport } from "../../../../utils/reportUtils";

interface CampaignCardActionsProps {
  campaignId: string;
  onJoin: () => void;
  onShare: () => void;
}

export default function CampaignCardActions({
  campaignId,
  onJoin,
  onShare,
}: CampaignCardActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div className={styles.cardActions}>
      <button
        className={styles.joinBtn}
        onClick={(e) => {
          e.stopPropagation();
          onJoin();
        }}
        style={{ cursor: "pointer" }}
      >
        Tham gia
      </button>
      <button
      className={styles.reportBtn}
      onClick={(e) => {
        e.stopPropagation();
        handleReport(campaignId);
      }}
      disabled={isSubmitting}
    >
      Báo cáo
    </button>
      <button
        className={styles.shareBtn}
        onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}
      >
        <FaShareAlt className="inline mr-1" />
        Chia sẻ
      </button>
    </div>
  );
}
