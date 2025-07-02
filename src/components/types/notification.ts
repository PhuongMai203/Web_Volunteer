export interface NotificationData {
  id: string;
  type: "feedback" | "payment";
  userName: string;
  amount?: number;
  comment?: string;
  campaignId: string;
  campaignTitle?: string;
  createdAt: Date;
  read: boolean;
}
