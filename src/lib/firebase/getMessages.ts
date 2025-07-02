import { collection, getDocs, query, where, orderBy, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FirestoreMessage {
  message: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp;
  participants: string[];
}

export async function getMessagesBetween(userId: string, partnerId: string): Promise<FirestoreMessage[]> {
  try {
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);

    const result: FirestoreMessage[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreMessage;
      if (data.participants.includes(partnerId)) {
        result.push(data);
      }
    });

    return result;
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    return [];
  }
}

export const saveMessage = async (msgData: {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Timestamp;
  participants: string[];
}) => {
  try {
    await addDoc(collection(db, "messages"), {
      senderId: msgData.senderId,
      receiverId: msgData.receiverId,
      message: msgData.message,
      timestamp: msgData.timestamp,
      participants: msgData.participants,
    });
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn:", error);
  }
};
