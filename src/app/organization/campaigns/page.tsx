"use client";

import CampaignList from "@/components/organization/CampaignList";
import React from "react";
import { useRouter } from "next/navigation";

export default function OrganizationCampaignsPage() {
  const router = useRouter();

  const handleSelectCampaign = (campaign: any) => {
    router.push(`/organization/campaigns/${campaign.id}`);
  };

  return (
    <CampaignList 
      userId={null} 
      onSelectCampaign={handleSelectCampaign} 
    />
  );
}
