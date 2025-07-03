"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "../../../styles/Campaigns/CampaignBoard.module.css";
import Image from "next/image";
import SearchBar from "../Home/SearchBar";
import { FaImage, FaRegFlag } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  getAllFeaturedActivities,
  FeaturedActivity,
} from "@/lib/firebase/getFeaturedActivities";
import Swal from "sweetalert2";
import CampaignCardActions from "../Home/sub/CampaignCardActions"; 
import { createCampaignDynamicLink } from "../../../lib/firebase/dynamicLinks";
import useBookmarks from "../../../lib/firebase/useBookmarks";
import { getAuth } from "firebase/auth";

const filters = [
  "Tất cả",
  "Xóa đói",
  "Trẻ em",
  "Người cao tuổi",
  "Người nghèo",
  "Người khuyết tật",
  "Bệnh hiểm nghèo",
  "Dân tộc thiểu số",
  "Lao động di cư",
  "Người vô gia cư",
  "Môi trường",
  "Xóa nghèo",
  "Thiên tai",
  "Giáo dục",
];

const partners = [
  {
    name: "Công ty TNHH Thiện Tâm",
    email: "contact@thientam.vn",
    logo: "/images/partner1.jpg",
  },
  {
    name: "Tập đoàn Xanh Bền Vững",
    email: "info@xanhbenvung.vn",
    logo: "/images/partner2.jpg",
  },
  {
    name: "Quỹ Hỗ trợ Cộng đồng",
    email: "support@quyhocongdong.org",
    logo: "/images/partner3.jpg",
  },
];

function formatDate(timestamp: { seconds: number } | null | undefined): string {
  if (!timestamp || typeof timestamp.seconds !== "number") return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CampaignBoardPage() {
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState<FeaturedActivity[]>([]);
  const searchParams = useSearchParams();
  const sortFilter = searchParams?.get("sort") || "default";
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

useEffect(() => {
  if (typeof window !== "undefined") {
    AOS.init({ duration: 800, once: true });
    setHasMounted(true);

    return () => {
      const aosElements = document.querySelectorAll("[data-aos]");
      aosElements.forEach((el) => {
        el.classList.remove("aos-animate");
      });
    };
  }
}, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await getAllFeaturedActivities();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  if (!hasMounted) {
    return null;
  }

  const now = new Date();

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesFilter =
      selectedFilter === "Tất cả" || c.category === selectedFilter;
    const matchesSearch = c.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const endDate = c.endDate?.seconds
      ? new Date(c.endDate.seconds * 1000)
      : null;

    const isInFuture = endDate && endDate > now;

    return matchesFilter && matchesSearch && isInFuture;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortFilter === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortFilter === "endDate") {
      const dateA = a.endDate?.seconds || 0;
      const dateB = b.endDate?.seconds || 0;
      return dateA - dateB;
    }
    return 0;
  });

  const goToDetail = (id: string) => {
    router.push(`/campaign/${id}`);
  };
  const handleShareCampaign = async (campaignId: string) => {
  try {
    const link = await createCampaignDynamicLink(campaignId); 

    if (navigator.share) {
  
      await navigator.share({
        title: 'Chiến dịch thiện nguyện từ HelpConnect',
        text: 'Hãy cùng lan tỏa yêu thương và tham gia chiến dịch ý nghĩa này!', 
        url: link, 
      });
    } else {
      await navigator.clipboard.writeText(link);
      Swal.fire("Đã sao chép link", link, "success");
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Chia sẻ bị hủy bởi người dùng.');
    } else {
      console.error("Lỗi khi chia sẻ hoặc tạo dynamic link:", error);
      Swal.fire("Lỗi", "Không thể chia sẻ hoặc tạo link chia sẻ.", "error");
    }
  }
};
  const handleToggleBookmark = (campaignId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Swal.fire("Vui lòng đăng nhập để lưu chiến dịch yêu thích.", "", "info");
      return;
    }

    toggleBookmark(campaignId);
  };
  return (
    <>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <section className={styles.boardWrapper}>
        <h1 className={styles.pageTitle} data-aos="fade-down">
          📰 Bảng tin chiến dịch
        </h1>

        <div className={styles.filterBar} data-aos="fade-up">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${
                selectedFilter === filter ? styles.activeFilter : ""
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.contentLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.grid}>
              {sortedCampaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className={styles.card}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={styles.imageContainer}>
                    {campaign.imageUrl ? (
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        fill
                        className={styles.imageUrl}
                        onClick={() => goToDetail(campaign.id)}
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FaImage className="text-gray-400 text-5xl" />
                      </div>
                    )}
                    <div
                      className={`${styles.flagIcon} ${bookmarkedIds.includes(campaign.id) ? styles.flagIconActive : ""}`}
                      onClick={() => handleToggleBookmark(campaign.id)}
                      style={{ cursor: "pointer" }}
                    >
                    <FaRegFlag
                      className={bookmarkedIds.includes(campaign.id) ? "text-orange-400" : "text-orange-600"}
                    />
                  </div>

                  </div>

                  <h3
                    className={styles.cardTitle}
                    onClick={() => goToDetail(campaign.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {campaign.title}
                  </h3>

                  <p
                    className={styles.cardDescription}
                    onClick={() => goToDetail(campaign.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {campaign.description}
                  </p>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      📅 Thời gian: {formatDate(campaign.startDate)} -{" "}
                      {formatDate(campaign.endDate)}
                    </div>
                    <div className={styles.metaItem}>
                      🏷️ Danh mục: {campaign.category}
                    </div>
                    <div className={styles.metaItem}>
                      ⚡ Mức độ khẩn cấp: {campaign.urgency}
                    </div>
                    <div className={styles.metaRow}>
                      <div className={styles.metaItemLeft}>
                        👥 {campaign.participantCount}/{campaign.maxVolunteerCount}
                      </div>
                      <div className={styles.metaItemRight}>
                        {campaign.totalDonationAmount?.toLocaleString()} đ
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <CampaignCardActions
                      campaignId={campaign.id}
                      onJoin={() => goToDetail(campaign.id)}
                      onShare={() => handleShareCampaign(campaign.id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <p className="text-center text-gray-500 mt-6" data-aos="fade-in">
                Không tìm thấy chiến dịch phù hợp.
              </p>
            )}
          </div>

          <div className={styles.rightColumn}>
            <h2 className={styles.partnerTitle} data-aos="fade-left">
              🤝 Đối tác
            </h2>
            <div className={styles.partnerList}>
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className={styles.partnerCard}
                  data-aos="fade-left"
                  data-aos-delay={index * 150}
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={48}
                    height={48}
                    className={styles.partnerLogo}
                  />
                  <div>
                    <p className={styles.partnerName}>{partner.name}</p>
                    <p className={styles.partnerEmail}>{partner.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
