"use client";

import AccountPersonalInfo from "@/components/user/Account/AccountPersonalInfo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserInfo } from "../../../components/types/user";

export default function AccountInfoPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserStr = localStorage.getItem("userInfo");
      if (!storedUserStr) {
        alert("Vui lòng đăng nhập!");
        router.push("/signin");
        return;
      }
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser?.uid) {
          fetchUserInfo(storedUser.uid);
        } else {
          alert("Vui lòng đăng nhập!");
          router.push("/signin");
        }
      } catch {
        alert("Vui lòng đăng nhập!");
        router.push("/signin");
      }
      setHasMounted(true);
    }
  }, [router]);

  const fetchUserInfo = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as { [key: string]: unknown };
        setUserInfo({
          uid,
          fullName: typeof data.fullName === "string" ? data.fullName : "",
          name: typeof data.name === "string" ? data.name : "",
          email: typeof data.email === "string" ? data.email : "",
          phone: typeof data.phone === "string" ? data.phone : "",
          address: typeof data.address === "string" ? data.address : "",
          birthYear: typeof data.birthYear === "string" ? data.birthYear : "",
        });
      } else {
        alert("Không tìm thấy thông tin người dùng!");
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    try {
      if (!userInfo) return;
      const userRef = doc(db, "users", userInfo.uid);
      await updateDoc(userRef, {
        fullName: userInfo.fullName,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address,
        birthYear: userInfo.birthYear,
      });
      alert("✅ Đã lưu thông tin!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin:", error);
      alert("Đã xảy ra lỗi khi lưu.");
    }
  };

  if (!hasMounted) return null;
  if (!userInfo) return <div>Đang tải thông tin...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý thông tin cá nhân</h1>
      <AccountPersonalInfo
        userInfo={userInfo}
        isEditing={isEditing}
        handleInputChange={handleInputChange}
      />

      <div className="mt-6 flex gap-4">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded"
              onClick={handleSave}
            >
              Lưu thay đổi
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded"
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}
