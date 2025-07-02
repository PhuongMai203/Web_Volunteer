import { db } from "../firebase";
import { collection, getDocs, query, where, updateDoc, doc, writeBatch } from "firebase/firestore";
import { auth } from "../firebase";
import { NotificationData } from "@/components/types/notification";

export const fetchNotifications = async (): Promise<NotificationData[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const feedbackRef = query(
    collection(db, "campaign_feedback"),
    where("campaignCreatorId", "==", user.uid)
  );

  const paymentRef = query(
    collection(db, "payments"),
    where("campaignCreatorId", "==", user.uid)
  );

  const [feedbackSnap, paymentSnap] = await Promise.all([
    getDocs(feedbackRef),
    getDocs(paymentRef),
  ]);

  const feedbacks: NotificationData[] = feedbackSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: "feedback",
      userName: data.userName || "",
      comment: data.comment || "",
      campaignId: data.campaignId || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
      read: data.read || false,
    };
  });

  const payments: NotificationData[] = paymentSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: "payment",
      userName: data.userName || "",
      amount: data.amount || 0,
      campaignId: data.campaignId || "",
      campaignTitle: data.campaignTitle || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
      read: data.read || false,
    };
  });

  const all = [...feedbacks, ...payments];
  return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const markAllAsRead = async (notifications: NotificationData[]) => {
  const batch = writeBatch(db);

  notifications.forEach(n => {
    const ref = doc(db, n.type === "feedback" ? "campaign_feedback" : "payments", n.id);
    batch.update(ref, { read: true });
  });

  await batch.commit();
};
