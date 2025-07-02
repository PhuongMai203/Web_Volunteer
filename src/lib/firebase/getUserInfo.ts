import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserInfoFromFirestore(uid: string) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.warn(`Không tìm thấy người dùng có ID: ${uid}`);
      return null;
    }

    const data = userSnap.data();

    return {
      id: uid,
      fullName: data.fullName || "",
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      birthYear: data.birthYear || "",
      rank: data.rank || "Đồng",
      avatarUrl: data.avatarUrl || "/images/default_avatar.jpg",
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
}

export async function getSharedCampaignParticipants(myId: string) {
  try {
    const q1 = query(collection(db, "campaign_registrations"), where("userId", "==", myId));
    const snap1 = await getDocs(q1);
    const campaignIds = snap1.docs.map(doc => doc.data().campaignId);

    if (campaignIds.length === 0) return [];

    const q2 = query(collection(db, "campaign_registrations"), where("campaignId", "in", campaignIds));
    const snap2 = await getDocs(q2);

    const userIds = new Set<string>();
    snap2.docs.forEach(doc => {
      const userId = doc.data().userId;
      if (userId !== myId) {
        userIds.add(userId);
      }
    });

    const promises = Array.from(userIds).map(async (uid) => {
      const info = await getUserInfoFromFirestore(uid);
      if (info) {
        return {
          id: uid,
          name: info.name, 
          avatar: info.avatarUrl,
          lastMessage: "",
          lastMessageTime: "",
        };
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người tham gia chung:", error);
    return [];
  }
}
