import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

export interface NotificationMetadata {
  company?: string;
  timestamp?: string;
  userEmail?: string;
  userId?: string;
  relatedId?: string;
  targetUserId?: string;
  type?: string;

  // Bổ sung cho báo cáo
  activityId?: string;
  reason?: string;

  // Bổ sung cho hỗ trợ
  name?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: NotificationMetadata;
  source: "notification" | "report" | "support";
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const notifications: Notification[] = [];

    // ===== Collection: notifications =====
    const notifQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const notifSnap = await getDocs(notifQuery);

    notifSnap.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        message: data.message || "",
        isRead: data.isRead ?? false,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
        metadata: {
          company: data.metadata?.company || "",
          timestamp: data.metadata?.timestamp || "",
          userEmail: data.metadata?.userEmail || "",
          userId: data.metadata?.userId || "",
          relatedId: data.metadata?.relatedId || "",
          targetUserId: data.metadata?.targetUserId || "",
          type: data.metadata?.type || "",
        },
        source: "notification",
      });
    });

    // ===== Collection: reports =====
    const reportSnap = await getDocs(collection(db, "reports"));
    reportSnap.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        message: `Báo cáo về hoạt động với lý do: ${data.reason || "Không rõ lý do"}`,
        isRead: data.isRead ?? false,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
        metadata: {
          userId: data.userId || "",
          activityId: data.activityId || "",
          reason: data.reason || "",
          type: "report",
        },
        source: "report",
      });
    });

    // ===== Collection: support_requests =====
    const supportSnap = await getDocs(collection(db, "support_requests"));
    supportSnap.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        message: `Yêu cầu hỗ trợ từ ${data.name || "người dùng"}`,
        isRead: data.isRead ?? false,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date(),
        metadata: {
          userEmail: data.userEmail || "",
          userId: data.userId || "",
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
          type: "support",
        },
        source: "support",
      });
    });

    // ===== Sắp xếp chung theo thời gian giảm dần =====
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return notifications;
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    return [];
  }
};
