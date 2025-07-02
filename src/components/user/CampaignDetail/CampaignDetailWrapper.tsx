"use client";

import { useEffect, useState } from "react";
import { CampaignDetailClient } from "../../types/campaign";
import { CampaignDetailHeader, CampaignDetailMainContent, CampaignDetailSidebar } from "./index";
import CampaignFeedbackList from "../../user/Account/CampaignFeedbackList"
import styles from "../../../styles/Campaigns/CampaignDetail.module.css";


interface UserInfo {
  uid: string;
  fullName: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  birthYear: string;
  avatarUrl: string;
}

interface Props {
  campaign: CampaignDetailClient;
}

export default function CampaignDetailWrapper({ campaign }: Props) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const userDataString = localStorage.getItem("userInfo");
       console.log("userInfo từ localStorage:", userDataString);
      if (userDataString) {
        setUserInfo(JSON.parse(userDataString));
      }
    }
  }, [hasMounted]);

  if (!hasMounted) return null;

  return (
    <div className={styles.container}>
      <CampaignDetailHeader campaign={campaign} />
      <div className={styles.contentWrapper}>
        <CampaignDetailMainContent campaign={campaign} />
        <CampaignDetailSidebar campaign={campaign} userInfo={userInfo} />
      </div>
      {campaign.endDate && new Date(campaign.endDate) < new Date() && (
        <CampaignFeedbackList
          campaignId={campaign.id}
          currentUser={
            userInfo
              ? {
                  userId: userInfo.uid,
                  userName: userInfo.name || userInfo.fullName,
                  avatarUrl: userInfo.avatarUrl || "/images/default_avatar.jpg",
                }
              : null
          }
          campaignCreatorId={campaign.creatorId || ""} 
          campaignTitle={campaign.title}
        />
      )}
    </div>
  );
}
