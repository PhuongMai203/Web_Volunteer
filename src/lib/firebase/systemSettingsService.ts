import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const SETTINGS_DOC_ID = "main"; // hoặc đặt tên khác nếu muốn

interface SystemSettings {
  generalInfo?: any;
  pointSettings?: any;
  categories?: { id: number; name: string }[];
  displaySettings?: any;
  policySettings?: any;
  updatedAt?: any;
}

export const saveSystemSettings = async (data: SystemSettings) => {
  const docRef = doc(db, "system_settings", SETTINGS_DOC_ID);
  await setDoc(docRef, data, { merge: true });
};

export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  const docRef = doc(db, "system_settings", SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as SystemSettings;
  }
  return null;
};
