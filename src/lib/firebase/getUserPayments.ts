import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Payment {
  amount: number;
  app_trans_id: string;
  campaignCreatorId: string;
  campaignId: string;
  campaignTitle: string;
  createdAt: Timestamp | Date | null;  // Sửa kiểu ở đây
  paymentMethod: string;
  read: boolean;
  status: string;
  userId: string;
  userName: string;
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, "payments"),
      where("userId", "==", userId),
      where("status", "==", "success")
    );
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push(doc.data() as Payment);
    });
    return payments;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách payments:", error);
    return [];
  }
}

export async function getTotalDonationByUser(userId: string): Promise<number> {
  const payments = await getPaymentsByUserId(userId);
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export async function getTotalDonationByUserForCampaign(userId: string, campaignTitle: string): Promise<number> {
  const payments = await getPaymentsByUserId(userId);
  const normalizedCampaignTitle = normalizeString(campaignTitle);

  return payments
    .filter((p) => {
      const titleNormalized = normalizeString(p.campaignTitle);
      console.log(`So sánh: "${titleNormalized}" vs "${normalizedCampaignTitle}"`);
      return titleNormalized.includes(normalizedCampaignTitle);
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

function normalizeString(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, " ")
    .trim();
}

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
