import { getRegistrationsByUserId, getCampaignTitlesByUserId } from "../lib/firebase/getCampaignRegistrations";

interface StaticIntent {
    name?: string;
  keywords: string[];
  response: string;
}

interface DynamicIntent {
    name?: string;
  keywords: string[];
  response: (userId: string, normalizedQuestion: string) => Promise<string>;
}

export const staticIntents: StaticIntent[] = [
  {
    keywords: ["quyên góp", "tiền"],
    response: "Thông tin về số tiền quyên góp được hiển thị trong chi tiết chiến dịch.",
  },
  {
    keywords: ["tài khoản", "cá nhân"],
    response: "Bạn có thể quản lý thông tin tài khoản trong mục 'Quản lý thông tin cá nhân'.",
  },
];

export const dynamicIntents: DynamicIntent[] = [
  {
    keywords: ["bao nhiêu", "chiến dịch", "tham gia"],
    response: async (userId: string) => {
      const registrations = await getRegistrationsByUserId(userId);
      return registrations.length === 0
        ? "Bạn chưa tham gia chiến dịch nào."
        : `Bạn đã tham gia ${registrations.length} chiến dịch.`;
    },
  },
  {
    keywords: ["những chiến dịch", "tham gia"],
    response: async (userId: string) => {
      const titles = await getCampaignTitlesByUserId(userId);
      return titles.length === 0
        ? "Bạn chưa tham gia chiến dịch nào."
        : `Bạn đã tham gia các chiến dịch sau: ${titles.join(", ")}.`;
    },
  },
  
];

export const campaignDetailKeywords = {
  startDate: ["bắt đầu", "khi nào"],
  endDate: ["kết thúc", "bao lâu"],
  participantCount: ["hiện tại", "bao nhiêu", "tham gia"],
  maxVolunteerCount: ["tối đa", "bao nhiêu người", "cần bao nhiêu"],
  supportType: ["hỗ trợ gì", "loại hình hỗ trợ"],
  bankInfo: ["ngân hàng", "số tài khoản"],
  address: ["địa chỉ", "ở đâu"],
  category: ["danh mục", "loại"],
  receivingMethod: ["phương thức", "nhận hỗ trợ"],
  totalDonationAmount: ["tổng tiền", "quyên góp được"],
  urgency: ["khẩn cấp", "mức độ"],
  description: ["mô tả", "là gì"],
};