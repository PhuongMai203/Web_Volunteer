import { Timestamp } from "firebase/firestore";

export interface CampaignDetail {
  id: string;
  title: string;
  description: string;
  address: string;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  category: string;
  supportType: string;
  urgency: string;
  receivingMethod: string;
  phoneNumber: string;
  totalDonationAmount: number;
  participantCount: number;
  maxVolunteerCount: number;
  imageUrl: string;
  bankName: string;
  bankAccount: string;
  creatorId: string;
}

export interface CampaignDetailClient {
  id: string;
  title: string;
  description: string;
  address: string;
  startDate: string | null; // string sau khi convert
  endDate: string | null;
  category: string;
  supportType: string;
  urgency: string;
  receivingMethod: string;
  phoneNumber: string;
  totalDonationAmount: number;
  participantCount: number;
  maxVolunteerCount: number;
  imageUrl: string;
  bankName: string;
  bankAccount: string;
  creatorId: string;
}
