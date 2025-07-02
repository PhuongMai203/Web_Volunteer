import React from "react";

export type CampaignStatus = "active" | "upcoming" | "completed";

export default function StatusBadge({ status }: { status: CampaignStatus }) {
  let bgColor = "";
  let textColor = "";
  let label = "";

  switch (status) {
    case "active":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Đang hoạt động";
      break;
    case "upcoming":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Sắp diễn ra";
      break;
    case "completed":
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      label = "Đã hoàn thành";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      label = "Không xác định";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
