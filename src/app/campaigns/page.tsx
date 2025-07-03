// src/app/campaigns/page.tsx
import { Suspense } from "react";
import CampaignBoardPage from "../../components/user/Campaigns/CampaignBoardPage";

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <CampaignBoardPage />
    </Suspense>
  );
}
