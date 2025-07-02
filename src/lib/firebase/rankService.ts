import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/// Hàm tính điểm, xét rank dựa trên system_settings, cập nhật Firestore và lưu lịch sử nếu rank thay đổi
export const calculateAndUpdateRank = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("Người dùng chưa đăng nhập");

  const userDocRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userDocRef);
  const currentRank = userSnapshot.data()?.rank || "";
  const userName = userSnapshot.data()?.name || "Tình nguyện viên";

  const q = query(collection(db, "campaign_registrations"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  let totalScore = 0;

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const types: string[] = data.participationTypes || [];
    const attendanceStatus = data.attendanceStatus;

    if (types.includes("Tham gia tình nguyện trực tiếp") && attendanceStatus === "Có mặt") {
      totalScore += 10;
    }
    if (types.includes("Đóng góp tiền")) {
      totalScore += 8;
    }
    if (types.includes("Đóng góp vật phẩm")) {
      totalScore += 5;
    }
  });

  /// Lấy dữ liệu khoảng điểm từ system_settings
  const settingsDoc = await getDoc(doc(db, "system_settings", "main"));
  const pointSettings = settingsDoc.data()?.pointSettings;

  if (!pointSettings) {
    throw new Error("Chưa cấu hình khoảng điểm trong system_settings");
  }

  /// Xét hạng dựa trên khoảng điểm từ Firestore
  let determinedRank = "Chưa có hạng";

  if (totalScore <= pointSettings.bronze) {
    determinedRank = "Đồng";
  } else if (totalScore <= pointSettings.silver) {
    determinedRank = "Bạc";
  } else if (totalScore <= pointSettings.gold) {
    determinedRank = "Vàng";
  } else if (totalScore <= pointSettings.diamond) {
    determinedRank = "Kim cương";
  } else {
    determinedRank = "VIP";
  }

  if (determinedRank !== currentRank) {
    await updateDoc(userDocRef, {
      rank: determinedRank,
    });

    await addDoc(collection(db, "user_rank_history"), {
      userId: user.uid,
      newRank: determinedRank,
      score: totalScore,
      timestamp: serverTimestamp(),
    });
  }

  return {
    score: totalScore,
    rank: determinedRank,
    userName,
    pointRule: pointSettings.pointRule || "",
  };
};
