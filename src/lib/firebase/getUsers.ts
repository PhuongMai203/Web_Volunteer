import { collection, getDocs, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserData {
  id: string;
  [key: string]: unknown;
}


export async function getAllUsers(): Promise<UserData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return users;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả người dùng:", error);
    return [];
  }
}

export async function getUserStats() {
  try {
    const userQuery = query(collection(db, "users"), where("role", "==", "user"));
    const orgQuery = query(collection(db, "users"), where("role", "==", "organization"));

    const [userSnap, orgSnap] = await Promise.all([
      getCountFromServer(userQuery),
      getCountFromServer(orgQuery),
    ]);

    return {
      volunteers: userSnap.data().count,
      organizations: orgSnap.data().count,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê người dùng:", error);
    return {
      volunteers: 0,
      organizations: 0,
    };
  }
}
