"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getUserInfoFromFirestore } from "@/lib/firebase/getUserInfo";
import { getTotalDonationByUser } from "@/lib/firebase/getUserPayments";
import { getDirectParticipationCount, getRegisteredCampaignCount, getCompletedDirectCampaigns, getUpcomingDirectCampaigns, UpcomingDirectCampaign } from "@/lib/firebase/getCampaignRegistrations";
import { getFeedbackCountByUserId } from "@/lib/firebase/getFeedbacks";
import { getAllFeaturedActivities, FeaturedActivity } from "@/lib/firebase/getFeaturedActivities";
import Link from "next/link";
import AccountHeader from "@/components/user/Account/AccountHeader";
import GoogleCalendarButton from "@/components/user/Home/sub/GoogleCalendarButton";
import UserRankBadge from "@/components/user/Account/UserRankBadge";
import styles from "../../../styles/Account/AccountPage.module.css";

interface CompletedDirectCampaign {
  id: string;
  title: string;
  endDate: Date;
}

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [totalDonation, setTotalDonation] = useState<number>(0);
  const [directParticipationCount, setDirectParticipationCount] = useState(0);
  const [registeredCampaignCount, setRegisteredCampaignCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [completedCampaigns, setCompletedCampaigns] = useState<CompletedDirectCampaign[]>([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<UpcomingDirectCampaign[]>([]);
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<FeaturedActivity[]>([]);
  const [userInfo, setUserInfo] = useState({ fullName: "", name: "", email: "", phone: "", address: "", birthYear: "", rank: "", avatarUrl: "/images/default_avatar.jpg", uid: "" });
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cachedDataString = localStorage.getItem("accountPageData");

    if (cachedDataString) {
      try {
        const cachedData = JSON.parse(cachedDataString);
        setUserInfo(cachedData.userInfo);
        setTotalDonation(cachedData.totalDonation ?? 0);
        setDirectParticipationCount(cachedData.directParticipationCount ?? 0);
        setRegisteredCampaignCount(cachedData.registeredCampaignCount ?? 0);
        setFeedbackCount(cachedData.feedbackCount ?? 0);
        setCompletedCampaigns(Array.isArray(cachedData.completedCampaigns) ? cachedData.completedCampaigns : []);
        setUpcomingCampaigns(Array.isArray(cachedData.upcomingCampaigns) ? cachedData.upcomingCampaigns : []);
        setBookmarkedCampaigns(Array.isArray(cachedData.bookmarkedCampaigns) ? cachedData.bookmarkedCampaigns : []);
        setCurrentUser({ uid: cachedData.userInfo.uid } as User);
      } catch (err) {
        console.error("Lỗi parse localStorage:", err);
      }
      setCheckingAuth(false);
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        setCheckingAuth(false);

        if (user) {
          try {
            const data = await getUserInfoFromFirestore(user.uid);
            if (data) setUserInfo({ ...data, uid: user.uid });
            setTotalDonation(await getTotalDonationByUser(user.uid));
            setDirectParticipationCount(await getDirectParticipationCount(user.uid));
            setRegisteredCampaignCount(await getRegisteredCampaignCount(user.uid));
            setFeedbackCount(await getFeedbackCountByUserId(user.uid));

            const completed = await getCompletedDirectCampaigns(user.uid);
            const upcoming = await getUpcomingDirectCampaigns(user.uid);
            const now = new Date();

            const completedFromUpcoming = upcoming.filter(c => c.endDate <= now);
            const stillUpcoming = upcoming.filter(c => c.endDate > now);

            setCompletedCampaigns([...completed, ...completedFromUpcoming]);
            setUpcomingCampaigns(stillUpcoming);

            const userSnap = await getDoc(doc(db, "users", user.uid));
            const bookmarkedIds = Array.isArray(userSnap.data()?.bookmarkedEvents) ? userSnap.data()?.bookmarkedEvents : [];

            const allActivities = await getAllFeaturedActivities();
            setBookmarkedCampaigns(allActivities.filter(a => bookmarkedIds.includes(a.id)));

            localStorage.setItem("accountPageData", JSON.stringify({
              userInfo: { ...data, uid: user.uid },
              totalDonation,
              directParticipationCount,
              registeredCampaignCount,
              feedbackCount,
              completedCampaigns: [...completed, ...completedFromUpcoming],
              upcomingCampaigns: stillUpcoming,
              bookmarkedCampaigns: allActivities.filter(a => bookmarkedIds.includes(a.id)),
            }));
          } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng hoặc dữ liệu thống kê:", error);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  if (checkingAuth) return <p className={styles.loadingMessage}>Đang kiểm tra xác thực...</p>;
  if (!currentUser) return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Vui lòng đăng nhập để xem thông tin tài khoản</h2>
        <p className={styles.loginDescription}>Bạn cần có tài khoản để truy cập trang cá nhân của mình.</p>
        <div className={styles.loginActions}>
          <div className={styles.personalAccountSection}>
            <p className={styles.personalAccountText}>Tài khoản dành cho cá nhân</p>
            <div className={styles.personalAccountButtons}>
              <Link href="/signin" className={styles.signInButton}>Đăng nhập</Link>
              <Link href="/signin?mode=signup" className={styles.signUpButton}>Đăng ký</Link>
            </div>
          </div>
          <div className={styles.businessAccountSection}>
            <p className={styles.businessAccountText}>Hoặc tài khoản doanh nghiệp</p>
            <Link href="/signupbn" className={styles.signUpBusinessButton}>Đăng ký doanh nghiệp</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <AccountHeader userInfo={userInfo} isEditing={isEditing} setIsEditing={setIsEditing} />
      <div className={styles.accountContentWrapper}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <UserRankBadge rank={userInfo.rank || "Chưa có"} />
        </div>

        <section className={styles.highlightedActivitiesSection}>
          <h2 className={styles.sectionTitle}>🌟 Hoạt động nổi bật</h2>
          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <p className={styles.activityNumber}>{(totalDonation ?? 0).toLocaleString("vi-VN")} ₫</p>
              <p className={styles.activityDescription}>Tổng tiền đã ủng hộ</p>
            </div>
            <div className={styles.activityCard}>
              <p className={styles.activityNumber}>{directParticipationCount}</p>
              <p className={styles.activityDescription}>Tham gia trực tiếp</p>
            </div>
            <div className={styles.activityCard}>
              <p className={styles.activityNumber}>{registeredCampaignCount}</p>
              <p className={styles.activityDescription}>Chiến dịch đã đăng ký</p>
            </div>
            <div className={styles.activityCard}>
              <p className={styles.activityNumber}>{feedbackCount}</p>
              <p className={styles.activityDescription}>Đã đánh giá</p>
            </div>
          </div>
        </section>

        <div className={styles.googleSyncButtonContainer}>
          <GoogleCalendarButton />
        </div>

        <section className={styles.eventsOfInterestSection}>
          <div className={styles.eventsHeader}>
            <h2 className={styles.sectionTitle}>📅 Sự kiện quan tâm</h2>
          </div>

          <div className={styles.tabsContainer}>
            {["Hoàn thành", "Đã đăng ký", "Đã lưu"].map((tab, index) => (
              <button key={index} onClick={() => setActiveTab(index)} className={`${styles.tabButton} ${activeTab === index ? styles.active : ""}`}>{tab}</button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 0 && Array.isArray(completedCampaigns) && completedCampaigns.map(campaign => (
              <div key={campaign.id} className={styles.eventCard} onClick={() => router.push(`/campaign/${campaign.id}`)} style={{ cursor: "pointer" }}>
                <p className={styles.eventTitle}>Chiến dịch "{campaign.title}"</p>
                <p className={styles.eventStatus}>Đã hoàn thành • {new Date(campaign.endDate).toLocaleDateString("vi-VN")}</p>
              </div>
            ))}

            {activeTab === 1 && Array.isArray(upcomingCampaigns) && upcomingCampaigns.map(campaign => (
              <div key={campaign.id} className={styles.eventCard} onClick={() => router.push(`/campaign/${campaign.id}`)} style={{ cursor: "pointer" }}>
                <p className={styles.eventTitle}>Chiến dịch "{campaign.title}"</p>
                <p className={styles.eventStatus}>Đã đăng ký • {new Date(campaign.endDate).toLocaleDateString("vi-VN")}</p>
              </div>
            ))}

            {activeTab === 2 && Array.isArray(bookmarkedCampaigns) && bookmarkedCampaigns.map(campaign => (
              <div key={campaign.id} className={styles.eventCard} onClick={() => router.push(`/campaign/${campaign.id}`)} style={{ cursor: "pointer" }}>
                <p className={styles.eventTitle}>Chiến dịch "{campaign.title}"</p>
                <p className={styles.eventStatus}>Đã lưu</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
