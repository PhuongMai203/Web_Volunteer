import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from "firebase/firestore";

/// Kiểm tra xem user đã đánh giá chiến dịch này chưa
export async function isAlreadyFeedback(campaignId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const q = query(
    collection(db, "campaign_feedback"),
    where("userId", "==", user.uid),
    where("campaignId", "==", campaignId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/// Gửi feedback lên Firestore
export async function submitFeedback({
  campaignId,
  rating,
  comment = "",
}: {
  campaignId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Bạn cần đăng nhập để gửi đánh giá.");

  // Lấy thông tin chiến dịch
  const campaignRef = doc(db, "featured_activities", campaignId);
  const campaignSnap = await getDoc(campaignRef);

  if (!campaignSnap.exists()) {
    throw new Error("Chiến dịch không tồn tại.");
  }

  const campaignData = campaignSnap.data();
  const title = campaignData?.title || "Không có tiêu đề";
  const creatorUserId = campaignData?.userId || "Không rõ";

  // Lấy thông tin người dùng
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const userName = userSnap.exists() ? userSnap.data()?.name : "Ẩn danh";

  // Gửi feedback
  await addDoc(collection(db, "campaign_feedback"), {
    userId: user.uid,
    userName,
    campaignId,
    title,
    campaignCreatorId: creatorUserId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
}
