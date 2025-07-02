import { getCampaignDetailById } from "@/lib/firebase/getFeaturedActivities";
import CampaignDetailWrapperClient from "@/components/user/CampaignDetail/CampaignDetailWrapperClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CampaignDetailClient } from "../../../components/types/campaign";

interface Props {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = await getCampaignDetailById(params.id);
  
  return {
    title: campaign?.title || "Chi tiết chiến dịch",
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const campaign = await getCampaignDetailById(params.id);

  if (!campaign) {
    notFound();
  }

  const formattedCampaign: CampaignDetailClient = {
    ...campaign,
    startDate: campaign.startDate?.seconds ? new Date(campaign.startDate.seconds * 1000).toISOString() : null,
    endDate: campaign.endDate?.seconds ? new Date(campaign.endDate.seconds * 1000).toISOString() : null,
  };

  return <CampaignDetailWrapperClient campaign={formattedCampaign} />;
}
