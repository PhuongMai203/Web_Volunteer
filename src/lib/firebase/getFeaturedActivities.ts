import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

export interface FeaturedActivity {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  totalDonationAmount: number;
  participantCount: number;
  maxVolunteerCount: number;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  urgency: string;
  [key: string]: unknown;
}

export async function getAllFeaturedActivities(): Promise<FeaturedActivity[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "featured_activities"));
    const activities: FeaturedActivity[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        title: data.title || "",
        category: data.category || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        totalDonationAmount: data.totalDonationAmount || 0,
        participantCount: data.participantCount || 0,
        maxVolunteerCount: data.maxVolunteerCount || 0,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        urgency: data.urgency || "",
      });
    });
    return activities;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chiến dịch nổi bật:", error);
    return [];
  }
}


// Thống kê chiến dịch và tỉnh thành
export async function getFeaturedStats() {
  try {
    const querySnapshot = await getDocs(collection(db, "featured_activities"));

    const cities = new Set<string>();
    let totalCampaigns = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalCampaigns++;

      if (data.address) {
        const city = extractCityFromAddress(data.address);
        if (city) cities.add(city);
      }
    });

    return {
      campaigns: totalCampaigns,
      cities: cities.size,
    };
  } catch (error) {
    console.error("Lỗi khi đếm chiến dịch và tỉnh thành:", error);
    return {
      campaigns: 0,
      cities: 0,
    };
  }
}

// ✅ Trích xuất tên tỉnh/thành từ address (phần cuối)
function extractCityFromAddress(address: string): string | null {
  const parts = address.split(",");
  const raw = parts[parts.length - 1]?.trim();
  return raw || null;
}
export interface CampaignDetail {
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


export async function getCampaignDetailById(campaignId: string): Promise<(CampaignDetail & { id: string }) | null> {
  try {
    const docRef = doc(db, "featured_activities", campaignId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        category: data.category || '',
        supportType: data.supportType || '',
        urgency: data.urgency || '',
        receivingMethod: data.receivingMethod || '',
        phoneNumber: data.phoneNumber || '',
        totalDonationAmount: data.totalDonationAmount || 0,
        participantCount: data.participantCount || 0,
        maxVolunteerCount: data.maxVolunteerCount || 0,
        imageUrl: data.imageUrl || '',
        bankName: data.bankName || '',
        bankAccount: data.bankAccount || '',
        creatorId: data.email || '',
      };
    } else {
      console.warn("Không tìm thấy chiến dịch với ID:", campaignId);
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết chiến dịch:", error);
    return null;
  }
}

