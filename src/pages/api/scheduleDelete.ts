import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, deleteAt } = req.body;

  if (!userId || !deleteAt) return res.status(400).json({ error: "Thiếu dữ liệu." });

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { scheduledDeleteAt: deleteAt });
    return res.status(200).json({ message: "Lên lịch xóa thành công." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lỗi máy chủ." });
  }
}
