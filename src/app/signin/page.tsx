// src/app/campaigns/page.tsx

import LoginPage from "@/components/auth/signin/SignIn";
import { Suspense } from "react";

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginPage />
    </Suspense>
  );
}
