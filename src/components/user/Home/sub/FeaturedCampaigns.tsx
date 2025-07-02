"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "../../../../styles/Home/sub/FeaturedCampaigns.module.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createCampaignDynamicLink } from "@/lib/firebase/dynamicLinks";
import Swal from "sweetalert2";
import Image from "next/image";
import CampaignCardActions from "./CampaignCardActions"; 
import { FaImage, FaRegFlag } from "react-icons/fa";
import useBookmarks from "../../../../lib/firebase/useBookmarks";

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

const FeaturedCampaigns = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
 const { bookmarkedIds, toggleBookmark } = useBookmarks();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "featured_activities"));
        const now = new Date();

        const fetchedCampaigns: Campaign[] = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "",
              description: data.description || "",
              imageUrl: data.imageUrl || "",
              category: data.category || "",
              urgency: data.urgency || "",
              participantCount: data.participantCount || 0,
              maxVolunteerCount: data.maxVolunteerCount || 0,
              totalDonationAmount: data.totalDonationAmount || 0,
              startDate: data.startDate || null,
              endDate: data.endDate || null,
            };
          })
          .filter((campaign) => {
            if (campaign.endDate?.toDate) {
              const endDate = campaign.endDate.toDate();
              return endDate > now;
            }
            return false;
          });

        setCampaigns(fetchedCampaigns);
      } catch (_error) {
        console.error("Lỗi khi lấy chiến dịch từ Firestore:", _error);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (!isDragging) {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += scrollSpeed;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    setIsDragging(true);
    dragStartX.current = e.pageX - container.offsetLeft;
    scrollStartX.current = container.scrollLeft;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollStartX.current - walk;
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  const duplicatedCampaigns = [...campaigns, ...campaigns];

  const formatDate = (timestamp: FirebaseTimestamp | null) => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("vi-VN");
  };

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

  if (!hasMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title} data-aos="fade-right">
        Các Chiến Dịch Nổi Bật
      </h1>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className={styles.scrollContainer}
      >
        {duplicatedCampaigns.map((campaign, index) => (
          <div
            key={campaign.id + "-" + index}
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
                onClick={() => goToDetail(campaign.id)}
              />

              <div
                className={`${styles.flagIcon} ${bookmarkedIds.includes(campaign.id) ? styles.flagIconActive : ""}`}
                onClick={() => toggleBookmark(campaign.id)}
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


            <h3
              className={styles.cardTitle}
              onClick={() => goToDetail(campaign.id)}
              style={{ cursor: "pointer" }}
            >
              {campaign.title}
            </h3>
            <p
              className={styles.cardDescriptionClamp}
              onClick={() => goToDetail(campaign.id)}
              style={{ cursor: "pointer" }}
            >
              {campaign.description}
            </p>
            <div
              className={styles.cardMeta}
              onClick={() => goToDetail(campaign.id)}
              style={{ cursor: "pointer" }}
            >
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
                onJoin={() => goToDetail(campaign.id)}
                onShare={() => handleShareCampaign(campaign.id)}
              />

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCampaigns;
