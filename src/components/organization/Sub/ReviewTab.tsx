"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../../../styles/organization/CampaignDetail.module.css";
import { FaStar } from "react-icons/fa";


interface ReviewTabProps {
  campaignId: string;
}

interface Feedback {
  id: string;
  userName: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export default function ReviewTab({ campaignId }: ReviewTabProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    const q = query(
      collection(db, "campaign_feedback"),
      where("campaignId", "==", campaignId)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userName: doc.data().userName,
      avatarUrl: doc.data().avatarUrl,
      rating: doc.data().rating,
      comment: doc.data().comment,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));

    setFeedbacks(data);

    if (data.length > 0) {
      const avg =
        data.reduce((sum, item) => sum + item.rating, 0) / data.length;
      setAverageRating(Number(avg.toFixed(1)));
    } else {
      setAverageRating(0);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN");
  };

  return (
    <div className={styles.reviewList}>
      <div className={styles.titleRow}>
        <h3>
         Số người đánh giá ({feedbacks.length}) {" "}
          <span className={styles.averageRating}>
            {averageRating} <FaStar color="gold" />
          </span>
        </h3>
      </div>

      {feedbacks.length === 0 ? (
        <p>Chưa có đánh giá nào.</p>
      ) : (
        feedbacks.map((f) => (
          <div key={f.id} className={styles.feedbackItem}>
            <div className={styles.feedbackLeft}>
                <img
                src={f.avatarUrl || "/images/default_avatar.jpg"}
                alt={f.userName}
                className={styles.avatar}
                />
                <div className={styles.feedbackContent}>
                <span className={styles.participantName}>{f.userName}</span>
                <div className={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={styles.starIcon}
                        color={star <= f.rating ? "#f39c12" : "#ddd"}
                    />
                    ))}
                </div>
                <p className={styles.comment}>{f.comment}</p>
                </div>
            </div>
            <p className={styles.createdAt}>{formatDate(f.createdAt)}</p>
            </div>
        ))
      )}
    </div>
  );
}
