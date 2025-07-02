import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getUserInfoFromFirestore } from "./getUserInfo";

export interface RankHistoryItem {
  id: string;
  userId: string;
  newRank: string;
  score: number;
  timestamp: string;
}

export interface RankNotification {
  id: string;
  newRank: string;
  timestamp: string;
  isNew?: boolean;
}

export const ranks = [
  { label: "Đồng", emoji: "🥉", minScore: 0, maxScore: 20 },
  { label: "Bạc", emoji: "🥈", minScore: 21, maxScore: 25 },
  { label: "Vàng", emoji: "🥇", minScore: 26, maxScore: 100 },
  { label: "Kim cương", emoji: "💎", minScore: 101, maxScore: 250 },
  { label: "VIP", emoji: "👑", minScore: 251, maxScore: 999999 },
] as const;

export type RankType = typeof ranks[number];

export async function getUserRankHistory(userId: string): Promise<RankHistoryItem[]> {
  try {
    const q = query(
      collection(db, "user_rank_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        newRank: data.newRank,
        score: data.score,
        timestamp: data.timestamp?.toDate().toISOString() || "",
      };
    });
  } catch (error) {
    console.error("❌ Error fetching rank history:", error);
    return [];
  }
}

export async function saveUserRankIfChanged(userId: string, newRank: string, score: number): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    const currentRank = userSnap.exists() && userSnap.data()?.rank ? userSnap.data().rank : "";

    if (currentRank !== newRank) {
      await addDoc(collection(db, "user_rank_history"), {
        userId,
        newRank,
        score,
        timestamp: serverTimestamp(),
      });

      await setDoc(userRef, { rank: newRank }, { merge: true });

      console.log("✅ Rank updated and history saved.");
    } else {
      console.log("⚠️ Rank unchanged, no action taken.");
    }
  } catch (error) {
    console.error("❌ Error saving rank:", error);
  }
}

export async function getUserRankData(userId: string): Promise<{
  totalScore: number;
  currentRank: RankType;
  nextRank: RankType | null;
  progressPercent: number;
  rankChanged: boolean;
}> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("User not found");

    const userData = userSnap.data();
    const totalScore = userData?.score || 0;
    const savedRank = userData?.rank || "";

    const currentRank = ranks.find(
      (r) => totalScore >= r.minScore && totalScore <= r.maxScore
    ) || ranks[0];

    const nextRank = ranks.find((r) => r.minScore > totalScore) || null;

    let progressPercent = 1;
    if (nextRank) {
      const range = nextRank.minScore - currentRank.minScore;
      progressPercent = (totalScore - currentRank.minScore) / range;
      progressPercent = Math.max(0, Math.min(progressPercent, 1));
    }

    const rankChanged = savedRank !== currentRank.label;

    return {
      totalScore,
      currentRank,
      nextRank,
      progressPercent,
      rankChanged,
    };
  } catch (error) {
    console.error("❌ Error getting rank data:", error);
    return {
      totalScore: 0,
      currentRank: ranks[0],
      nextRank: ranks[1],
      progressPercent: 0,
      rankChanged: false,
    };
  }
}

export async function getRankNotifications(userId: string): Promise<RankNotification[]> {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const userInfo = await getUserInfoFromFirestore(userId);
    if (!userInfo) return [];

    const currentRank = userInfo.rank || "Đồng";
    const oldRank = localStorage.getItem("rank") || "Đồng";

    if (currentRank !== oldRank) {
      localStorage.setItem("rank", currentRank);
      return [
        {
          id: Date.now().toString(),
          newRank: currentRank,
          timestamp: new Date().toISOString(),
          isNew: true,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error("❌ Error fetching rank notifications:", error);
    return [];
  }
}
