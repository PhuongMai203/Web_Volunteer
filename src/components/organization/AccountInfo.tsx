"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { UserInfo, BusinessVerification } from "@/components/types/user";

import { getUserInfoFromFirestore } from "@/lib/firebase/getUserInfo";
import { collection, getDocs, query, where } from "firebase/firestore";
import OrganizationHeader from "./OrganizationHeader";
import styles from "../../styles/organization/AccountInfo.module.css";

export default function AccountInfo() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [legalInfo, setLegalInfo] = useState<BusinessVerification | null>(null);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    birthYear: "",
    rank: "",
    avatarUrl: "/images/default_avatar.jpg",
    uid: "",
  });

  const router = useRouter();

  useEffect(() => {
    const cachedDataString = localStorage.getItem("accountPageData");

    if (cachedDataString) {
      const cachedData = JSON.parse(cachedDataString);
      setUserInfo(cachedData.userInfo);
      setCurrentUser({ uid: cachedData.userInfo.uid } as User);
      fetchLegalInfo(cachedData.userInfo.uid);
      setCheckingAuth(false);
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        setCheckingAuth(false);

        if (user) {
          await refreshUserInfo(user.uid);
          fetchLegalInfo(user.uid);
        } else {
          router.push("/signin");
        }
      });

      return () => unsubscribe();
    }
  }, [router]);

  const refreshUserInfo = async (userId: string) => {
    try {
      const data = await getUserInfoFromFirestore(userId);
      const newUserInfo: UserInfo = {
        fullName: data?.fullName || "",
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        address: data?.address || "",
        birthYear: data?.birthYear || "",
        rank: data?.rank || "",
        avatarUrl: data?.avatarUrl || "/images/default_avatar.jpg",
        uid: userId,
      };

      setUserInfo(newUserInfo);
      localStorage.setItem(
        "accountPageData",
        JSON.stringify({ userInfo: newUserInfo })
      );
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tài khoản:", error);
    }
  };

  useEffect(() => {
    if (userInfo.uid) {
      const cachedDataString = localStorage.getItem("accountPageData");
      const cachedData = cachedDataString ? JSON.parse(cachedDataString) : {};
      localStorage.setItem(
        "accountPageData",
        JSON.stringify({ ...cachedData, userInfo })
      );
    }
  }, [userInfo]);

  const fetchLegalInfo = async (userId: string) => {
    try {
      const q = query(
        collection(db, "businessVerifications"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data() as BusinessVerification;
        setLegalInfo(docData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin pháp lý:", error);
    }
  };

  if (checkingAuth)
    return <p className={styles.loadingMessage}>Đang kiểm tra xác thực...</p>;

  return (
    <div className={styles.pageWrapper}>
      <OrganizationHeader
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        refreshUserInfo={refreshUserInfo}
      />
      
      {legalInfo ? (
        <div className={styles.legalSection}>
        <h2 className={styles.legalTitle}>Thông tin pháp lý doanh nghiệp</h2>

        <div className={styles.legalContent}>
          {/* Cột trái: Thông tin */}
         <div className={styles.leftColumn}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Tên doanh nghiệp:</span>
            <span className={styles.value}>{legalInfo.companyName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Mã số thuế:</span>
            <span className={styles.value}>{legalInfo.taxCode}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Giấy phép kinh doanh:</span>
            <span className={styles.value}>{legalInfo.license}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Người đại diện:</span>
            <span className={styles.value}>{legalInfo.representativeName} ({legalInfo.position})</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Số CCCD:</span>
            <span className={styles.value}>{legalInfo.idNumber}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Địa chỉ:</span>
            <span className={styles.value}>{legalInfo.address}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Ngân hàng:</span>
            <span className={styles.value}>{legalInfo.bankName} - {legalInfo.branch}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Số tài khoản:</span>
            <span className={styles.value}>{legalInfo.accountNumber} - Chủ TK: {legalInfo.accountHolder}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Trạng thái xác minh:</span>
            <span className={styles.value}>{legalInfo.status}</span>
          </div>
        </div>

          {/* Cột phải: Hình ảnh */}
          <div className={styles.rightColumn}>
          <div className={styles.imageGroup}>
            <div>
              <p className={styles.imageLabel}>Ảnh CCCD mặt trước</p>
              <img src={legalInfo.idCardFrontUrl} alt="CCCD mặt trước" />
            </div>
            <div>
              <p className={styles.imageLabel}>Ảnh CCCD mặt sau</p>
              <img src={legalInfo.idCardBackUrl} alt="CCCD mặt sau" />
            </div>
            <div>
              <p className={styles.imageLabel}>Ảnh chân dung</p>
              <img src={legalInfo.portraitUrl} alt="Ảnh chân dung" />
            </div>
            <div>
              <p className={styles.imageLabel}>Logo doanh nghiệp</p>
              <img src={legalInfo.logoUrl} alt="Logo" />
            </div>
            <div>
              <p className={styles.imageLabel}>Con dấu</p>
              <img src={legalInfo.stampUrl} alt="Con dấu" />
            </div>
          </div>
        </div>
        </div>
      </div>

      ) : (
        <p className={styles.noLegalInfo}>Chưa có thông tin pháp lý doanh nghiệp.</p>
      )}
    </div>
  );
}
