import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

// Interface chuẩn theo dữ liệu Firebase bạn đã cung cấp
export interface CampaignFeedback {
  id: string;
  campaignCreatorId: string;
  campaignId: string;
  title: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  read: boolean;
  createdAt: Timestamp | Date | null;  // Sửa kiểu ở đây
}

export async function getAllCampaignFeedbacks(): Promise<CampaignFeedback[]> {
  try {
    const feedbackRef = collection(db, "campaign_feedback");
    const snapshot = await getDocs(feedbackRef);

    const feedbacks: CampaignFeedback[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CampaignFeedback[];

    return feedbacks;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phản hồi chiến dịch:", error);
    return [];
  }
}

export async function getFeedbackCountByUserId(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, "campaign_feedback"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Lỗi khi lấy số lượng đánh giá của người dùng:", error);
    return 0;
  }
}
