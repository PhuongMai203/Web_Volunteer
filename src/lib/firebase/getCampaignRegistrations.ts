import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FeaturedActivity, getAllFeaturedActivities } from "./getFeaturedActivities";

export interface CampaignRegistration {
  id: string;
  campaignId: string;
  userId: string;
  method: string;
  createdAt?: Date;
  [key: string]: unknown;
}

export interface CompletedDirectCampaign {
  id: string;
  title: string;
  endDate: Date;
}

export interface UpcomingDirectCampaign {
  id: string;
  title: string;
  endDate: Date;
}

// Định nghĩa interface cho campaign và userInfo dùng trong registerForCampaign
interface Campaign {
  id: string;
  title: string;
  email?: string;
  participantCount?: number;
}

interface UserInfo {
  avatarUrl?: string;
  birthYear?: string | number | string;
  email?: string;
  address?: string;
  name?: string;
  phone?:string | number | string;
}

interface CampaignRegistrationData {
  avatarUrl?: string;
  birthYear?: string | number | string;
  campaignId: string;
  donationAmount?: string;
  email?: string;
  email_campaign?: string;
  location?: string;
  name?: string;
  participationTypes?: string[];
  timestamp?: Date;
  title?: string;
  userId: string;
  phone: string | number | string;
}

export async function getRegistrationsByUserId(userId: string): Promise<CampaignRegistration[]> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CampaignRegistration[];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách theo userId:", error);
    return [];
  }
}

export async function getCampaignTitlesByUserId(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const campaignIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.campaignId) {
        campaignIds.push(data.campaignId);
      }
    });

    const titles: string[] = [];
    for (const campaignId of campaignIds) {
      const campaignDoc = await getDoc(doc(db, "featured_activities", campaignId));
      if (campaignDoc.exists()) {
        const campaignData = campaignDoc.data();
        if (campaignData?.title) {
          titles.push(campaignData.title);
        }
      }
    }

    return titles;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chiến dịch:", error);
    return [];
  }
}

export async function getDirectParticipationCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const types = data.participationTypes || [];
      if (Array.isArray(types) && types.includes("Tham gia tình nguyện trực tiếp")) {
        count += 1;
      }
    });

    return count;
  } catch (error) {
    console.error("Lỗi khi đếm chiến dịch tham gia trực tiếp:", error);
    return 0;
  }
}

export async function getRegisteredCampaignCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const types = data.participationTypes || [];
      if (
        Array.isArray(types) &&
        (types.includes("Tham gia tình nguyện trực tiếp") || types.includes("Đóng góp vật phẩm"))
      ) {
        count += 1;
      }
    });

    return count;
  } catch (error) {
    console.error("Lỗi khi đếm số chiến dịch đã đăng ký:", error);
    return 0;
  }
}

export async function getCompletedDirectCampaigns(userId: string): Promise<CompletedDirectCampaign[]> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const campaignIds: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const types = data.participationTypes || [];
      if (Array.isArray(types) && types.includes("Tham gia tình nguyện trực tiếp")) {
        campaignIds.push(data.campaignId);
      }
    });

    const results: CompletedDirectCampaign[] = [];
    const now = new Date();

    for (const id of campaignIds) {
      const campaignRef = doc(db, "featured_activities", id);
      const campaignSnap = await getDoc(campaignRef);

      if (campaignSnap.exists()) {
        const campaignData = campaignSnap.data() as FeaturedActivity;

        if (campaignData.endDate && campaignData.title) {
          const endDate = new Date(campaignData.endDate.toDate());
          if (endDate < now) {
            results.push({
              id,
              title: campaignData.title,
              endDate,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Lỗi khi lấy chiến dịch đã hoàn thành:", error);
    return [];
  }
}

export async function getUpcomingDirectCampaigns(userId: string): Promise<UpcomingDirectCampaign[]> {
  try {
    const q = query(collection(db, "campaign_registrations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const campaignIds: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const types = data.participationTypes || [];
      if (Array.isArray(types) && types.includes("Tham gia tình nguyện trực tiếp")) {
        campaignIds.push(data.campaignId);
      }
    });

    const results: UpcomingDirectCampaign[] = [];
    const now = new Date();

    for (const id of campaignIds) {
      const campaignRef = doc(db, "featured_activities", id);
      const campaignSnap = await getDoc(campaignRef);

      if (campaignSnap.exists()) {
        const campaignData = campaignSnap.data() as FeaturedActivity;

        if (campaignData.endDate && campaignData.title) {
          const endDate = new Date(campaignData.endDate.toDate());
          if (endDate > now) {
            results.push({
              id,
              title: campaignData.title,
              endDate,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Lỗi khi lấy chiến dịch tương lai đã đăng ký:", error);
    return [];
  }
}

export async function getUpcomingCampaignNotifications(userId: string) {
  try {
    const registrations = await getRegistrationsByUserId(userId);
    const allActivities = await getAllFeaturedActivities();

    const now = new Date();
    const notifications = [];

    for (const reg of registrations) {
      const activity = allActivities.find(a => a.id === reg.campaignId);
      if (!activity || !activity.startDate) continue;

      const startDate = new Date(activity.startDate.toDate?.() || activity.startDate);
      const diffInDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffInDays === 2) {
        notifications.push({
          id: activity.id,
          title: activity.title,
          startDate,
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error("Lỗi khi lấy thông báo chiến dịch sắp bắt đầu:", error);
    return [];
  }
}

export async function getAttendanceNotifications(userId: string) {
  try {
    const q = query(
      collection(db, "campaign_registrations"),
      where("userId", "==", userId),
      where("attendanceStatus", "==", "Có mặt")
    );

    const snapshot = await getDocs(q);
    const notifications = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const campaignId = data.campaignId;

      if (!campaignId) continue;

      const campaignDoc = await getDoc(doc(db, "featured_activities", campaignId));
      if (campaignDoc.exists()) {
        const campaignData = campaignDoc.data() as FeaturedActivity;
        notifications.push({
          id: campaignId,
          title: campaignData.title,
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error("Lỗi khi lấy thông báo điểm danh:", error);
    return [];
  }
}

export async function registerForCampaign(
  userId: string,
  campaign: Campaign,
  userInfo: UserInfo,
  participationType: string
) {
  try {
    const campaignDocRef = doc(db, "featured_activities", campaign.id);
    const campaignDocSnap = await getDoc(campaignDocRef);

    if (!campaignDocSnap.exists()) {
      console.error("Không tìm thấy chiến dịch trên Firestore với ID:", campaign.id);
      return false;
    }

    const campaignData = campaignDocSnap.data();
    const emailCampaign = campaignData?.email || "";

    const registrationData: CampaignRegistrationData = {
      avatarUrl: userInfo.avatarUrl || '',
      birthYear: userInfo.birthYear || '',
      campaignId: campaign.id,
      donationAmount: '',
      email: userInfo.email || '',
      email_campaign: emailCampaign,
      location: userInfo.address || '',
      phone: userInfo.phone || '',
      name: userInfo.name || '',
      participationTypes: [participationType],
      timestamp: new Date(),
      title: campaign.title,
      userId: userId,
    };

    await addDoc(collection(db, "campaign_registrations"), registrationData);

    // Cập nhật participantCount +1
    const currentCount = campaignData?.participantCount || 0;
    await updateDoc(campaignDocRef, {
      participantCount: currentCount + 1,
    });

    return true;
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return false;
  }
}
