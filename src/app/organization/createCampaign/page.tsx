"use client";

import CreateCampaignForm from "@/components/organization/CreateCampaignForm";
import { useRouter } from "next/navigation";
import React from "react";

export default function OrgCreateCampaignsPage() {
  const router = useRouter();

  const handleSuccess = () => {
    alert("Tạo chiến dịch thành công!");
    router.push("/organization/campaigns"); 
  };

  const handleCancel = () => {
    router.push("/organization/createCampaign");
  };

  return (
    <CreateCampaignForm 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
