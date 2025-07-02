"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import styles from "../../../styles/Account/CampaignFeedbackList.module.css";
import { FaStar, FaRegStar } from "react-icons/fa";

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  campaignId: string;
  comment: string;
  rating: number;
  createdAt: any;
  campaignCreatorId?: string;
  title?: string;
}

interface Props {
  campaignId: string;
  currentUser: {
    userId: string;
    userName: string;
    avatarUrl: string;
  } | null;
  campaignCreatorId: string;
  campaignTitle: string;
}

export default function CampaignFeedbackList({
  campaignId,
  currentUser,
  campaignCreatorId,
  campaignTitle,
}: Props) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userHasSubmittedFeedback, setUserHasSubmittedFeedback] = useState<boolean>(false);

  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "campaign_feedback"),
      where("campaignId", "==", campaignId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          ...raw,
          createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date(),
        };
      }) as FeedbackItem[];

      setFeedbacks(data);

      if (data.length > 0) {
        const total = data.reduce((sum, item) => sum + item.rating, 0);
        setAverageRating(total / data.length);
      } else {
        setAverageRating(0);
      }

      if (currentUser?.userId) {
        const submitted = data.some(item => item.userId === currentUser.userId);
        setUserHasSubmittedFeedback(submitted);
      } else {
        setUserHasSubmittedFeedback(false);
      }
    });

    return () => unsubscribe();
  }, [campaignId, currentUser]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!currentUser) {
      setSubmitError("Bạn cần đăng nhập để gửi phản hồi.");
      return;
    }
    if (newRating === 0) {
      setSubmitError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!newComment.trim()) {
      setSubmitError("Vui lòng nhập bình luận của bạn.");
      return;
    }

    setIsSubmitting(true);
    console.log("avatarUrl gửi lên Firestore:", currentUser?.avatarUrl);

    try {
      await addDoc(collection(db, "campaign_feedback"), {
        userId: currentUser.userId,
        userName: currentUser.userName,
        avatarUrl: currentUser.avatarUrl || "/images/default_avatar.jpg",
        campaignId,
        comment: newComment.trim(),
        rating: newRating,
        createdAt: serverTimestamp(),
        campaignCreatorId,
        title: campaignTitle,
      });

      setNewRating(0);
      setNewComment("");
      console.log("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      setSubmitError("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.feedbackContainer}>
      <h3 className={styles.title}>
        Phản hồi từ người tham gia{" "}
        <span className={styles.averageRating}>
          <FaStar color="orange" /> {averageRating.toFixed(1)} / 5
        </span>
      </h3>

      {currentUser && !userHasSubmittedFeedback ? (
        <div className={styles.feedbackForm}>
          <h4 className={styles.formTitle}>Gửi phản hồi của bạn về chiến dịch này</h4>
          <form onSubmit={handleSubmitFeedback}>
            <div className={styles.starRatingWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`${styles.starIcon} ${star <= newRating ? styles.activeStar : ""}`}
                >
                  {star <= newRating ? (
                    <FaStar color="orange" size={28} />
                  ) : (
                    <FaRegStar color="orange" size={28} />
                  )}
                </span>
              ))}
            </div>

            {newRating === 0 && submitError?.includes("chọn số sao") && (
              <p className={styles.errorText}>{submitError}</p>
            )}

            <textarea
              className={styles.commentInput}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            ></textarea>

            {newComment.trim() === "" && submitError?.includes("nhập bình luận") && (
              <p className={styles.errorText}>{submitError}</p>
            )}

            {submitError &&
              !submitError.includes("chọn số sao") &&
              !submitError.includes("nhập bình luận") && (
                <p className={styles.errorText}>{submitError}</p>
              )}

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </form>
        </div>
      ) : currentUser && userHasSubmittedFeedback ? (
        <p className={styles.hasSubmittedMessage}>Bạn đã gửi phản hồi cho chiến dịch này.</p>
      ) : (
        <p className={styles.loginToFeedbackMessage}>Vui lòng đăng nhập để gửi phản hồi.</p>
      )}

      <div className={styles.feedbackListSection}>
        <h4 className={styles.sectionTitle}>Các phản hồi khác</h4>
        {feedbacks.length === 0 ? (
          <p className={styles.noFeedback}>Chưa có phản hồi nào.</p>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className={styles.feedbackItem}>
              <div className={styles.userInfo}>
                <div className={styles.leftInfo}>
                  <img
                    src={item.avatarUrl || "/images/default_avatar.jpg"}
                    alt={item.userName}
                    className={styles.avatar}
                  />
                  <span className={styles.userName}>{item.userName}</span>
                </div>
                <span className={styles.dateText}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                </span>
              </div>

              <div className={styles.rating}>
                {Array.from({ length: 5 }, (_, index) =>
                  index < item.rating ? (
                    <FaStar key={index} color="orange" />
                  ) : (
                    <FaRegStar key={index} color="orange" />
                  )
                )}
              </div>

              <p className={styles.comment}>{item.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
