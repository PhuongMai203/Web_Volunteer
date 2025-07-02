"use client";

import CampaignDetailWrapper from "./CampaignDetailWrapper";
import { CampaignDetailClient } from "../../types/campaign";

interface Props {
  campaign: CampaignDetailClient;
}

export default function CampaignDetailWrapperClient({ campaign }: Props) {
  return <CampaignDetailWrapper campaign={campaign} />;
}
