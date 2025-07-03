import styles from "@/styles/Home/sub/FeaturedCampaigns.module.css";
import { useRouter } from "next/navigation";
import { FaImage, FaRegFlag } from "react-icons/fa";
import Image from "next/image";
import CampaignCardActions from "./CampaignCardActions";
import useBookmarks from "@/lib/firebase/useBookmarks";
import { getAuth } from "firebase/auth";
import Swal from "sweetalert2";

interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  urgency: string;
  participantCount: number;
  maxVolunteerCount: number;
  totalDonationAmount: number;
  startDate: FirebaseTimestamp | null;
  endDate: FirebaseTimestamp | null;
}

interface Props {
  campaign: Campaign;
  index: number;
  onShare: (id: string) => void;
}

export default function CampaignCard({ campaign, index, onShare }: Props) {
  const router = useRouter();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  const formatDate = (timestamp: FirebaseTimestamp | null) => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("vi-VN");
  };

  const goToDetail = () => {
    router.push(`/campaign/${campaign.id}`);
  };
  const handleToggleBookmark = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Swal.fire("Vui lòng đăng nhập để lưu chiến dịch yêu thích.", "", "info");
      return;
    }

    toggleBookmark(campaign.id);
  };

  return (
    <div
      className={styles.card}
      data-aos="fade-up"
      data-aos-delay={index * 80}
    >
      <div className={styles.imageContainer}>
        {campaign.imageUrl ? (
          <div className={styles.imageWrapper}>
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              width={350}
              height={160}
              className={styles.cardImage}
              style={{ objectFit: "cover", cursor: "pointer" }}
              onClick={goToDetail}
            />
          <div
            className={`${styles.flagIcon} ${bookmarkedIds.includes(campaign.id) ? styles.flagIconActive : ""}`}
            onClick={handleToggleBookmark}
            style={{ cursor: "pointer" }}
          >
            <FaRegFlag
              className={bookmarkedIds.includes(campaign.id) ? "text-orange-400" : "text-orange-600"}
            />
          </div>

          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <FaImage className="text-gray-400 text-5xl" />
          </div>
        )}
      </div>

      <h3 className={styles.cardTitle} onClick={goToDetail} style={{ cursor: "pointer" }}>
        {campaign.title}
      </h3>
      <p className={styles.cardDescriptionClamp} onClick={goToDetail} style={{ cursor: "pointer" }}>
        {campaign.description}
      </p>
      <div className={styles.cardMeta} onClick={goToDetail} style={{ cursor: "pointer" }}>
        <div className={styles.metaItem}>
          📅 Thời gian: {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
        </div>
        <div className={styles.metaItem}>🏷️ Danh mục: {campaign.category}</div>
        <div className={styles.metaItem}>⚡ Mức độ khẩn cấp: {campaign.urgency}</div>
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
          onJoin={goToDetail}
          onShare={() => onShare(campaign.id)}
        />
      </div>
    </div>
  );
}
