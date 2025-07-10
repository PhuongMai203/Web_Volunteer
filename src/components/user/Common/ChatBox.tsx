"use client";

import { useState, useRef, useEffect } from "react";
import {  X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import styles from "../../../styles/Common/ChatBox.module.css";
import { getTotalDonationByUser, getTotalDonationByUserForCampaign } from "../../../lib/firebase/getUserPayments";

import { removeDiacritics, calculateSimilarity } from "../../../utils/stringUtils";
import { staticIntents, dynamicIntents, campaignDetailKeywords } from "../../../utils/intentData";
import { extractCampaignTitle } from "../../../utils/campaignUtils";
import { getAllFeaturedActivities } from "../../../lib/firebase/getFeaturedActivities";
import { askGemini } from "../../../lib/gemini/askGemini";

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Xin chào! Bạn cần hỗ trợ gì?" },
  ]);
  const [hasMounted, setHasMounted] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!hasMounted) {
    return null;
  }

  const handleProcess = async () => {
    if (question.trim() === "") return;

    const normalizedQuestion = removeDiacritics(question.toLowerCase());
    const userInfo = localStorage.getItem("userInfo");
    const userId = userInfo ? JSON.parse(userInfo).uid : "";

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setQuestion("");
    setLoading(true);

    if (normalizedQuestion.includes("ung ho") && normalizedQuestion.includes("bao nhieu")) {
      if (!userId) {
        setMessages((prev) => [...prev, { role: "bot", text: "Vui lòng đăng nhập để xem thông tin này." }]);
        setLoading(false);
        return;
      }

      const campaignNameRaw = extractCampaignTitle(question);

      if (campaignNameRaw) {
        const total = await getTotalDonationByUserForCampaign(userId, campaignNameRaw);
        setMessages((prev) => [...prev, { role: "bot", text: `Bạn đã ủng hộ tổng cộng ${total.toLocaleString("vi-VN")} VND cho chiến dịch "${campaignNameRaw}".` }]);
      } else {
        const total = await getTotalDonationByUser(userId);
        setMessages((prev) => [...prev, { role: "bot", text: `Tổng số tiền bạn đã ủng hộ cho tất cả các chiến dịch là: ${total.toLocaleString("vi-VN")} VND.` }]);
      }

      setLoading(false);
      return;
    }

    for (const intent of staticIntents) {
      const allKeywordsMatch = intent.keywords.every((kw) =>
        normalizedQuestion.includes(removeDiacritics(kw.toLowerCase()))
      );
      if (allKeywordsMatch) {
        setMessages((prev) => [...prev, { role: "bot", text: intent.response }]);
        setLoading(false);
        return;
      }
    }

    for (const intent of dynamicIntents) {
      if (intent.keywords.includes("chiến dịch") && intent.keywords.length === 1) continue;

      const allKeywordsMatch = intent.keywords.every((kw) =>
        normalizedQuestion.includes(removeDiacritics(kw.toLowerCase()))
      );
      if (allKeywordsMatch) {
        const dynamicReply = await intent.response(userId, normalizedQuestion);
        setMessages((prev) => [...prev, { role: "bot", text: dynamicReply }]);
        setLoading(false);
        return;
      }
    }

    const campaignIntent = dynamicIntents.find(
      (intent) => intent.keywords.includes("chiến dịch") && intent.keywords.length === 1
    );

    if (campaignIntent) {
      const campaignNameRaw = extractCampaignTitle(question);

      if (campaignNameRaw) {
        const campaignNameNormalized = removeDiacritics(campaignNameRaw.toLowerCase());
        const allCampaigns = await getAllFeaturedActivities();

        let bestMatch = null;
        let bestMatchScore = 0;

        for (const detail of allCampaigns) {
          if (detail?.title) {
            const titleNormalized = removeDiacritics(detail.title.toLowerCase());
            const similarity = calculateSimilarity(titleNormalized, campaignNameNormalized);
            if (similarity > bestMatchScore) {
              bestMatchScore = similarity;
              bestMatch = detail;
            }
          }
        }

        if (bestMatch && bestMatchScore >= 0.4) {
          let reply = "Tôi chưa rõ bạn muốn hỏi gì về chiến dịch này.";

          if (
            normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.endDate[0])) ||
            (normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.endDate[1])) &&
              !normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.startDate[0])))
          ) {
            const endDate = bestMatch.endDate?.seconds
              ? new Date(bestMatch.endDate.seconds * 1000).toLocaleDateString("vi-VN")
              : "Không rõ";
            reply = `Chiến dịch "${bestMatch.title}" kết thúc vào ngày: ${endDate}.`;
          } else if (
            normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.startDate[0])) ||
            (normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.startDate[1])) &&
              !normalizedQuestion.includes(removeDiacritics(campaignDetailKeywords.endDate[0])))
          ) {
            const startDate = bestMatch.startDate?.seconds
              ? new Date(bestMatch.startDate.seconds * 1000).toLocaleDateString("vi-VN")
              : "Không rõ";
            reply = `Chiến dịch "${bestMatch.title}" bắt đầu từ ngày: ${startDate}.`;
          } else if (campaignDetailKeywords.participantCount.every((kw) => normalizedQuestion.includes(removeDiacritics(kw)))) {
            reply = `Hiện tại có ${bestMatch.participantCount || 0} tình nguyện viên tham gia chiến dịch "${bestMatch.title}".`;
          } else if (
            campaignDetailKeywords.maxVolunteerCount.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Chiến dịch "${bestMatch.title}" cần tối đa ${bestMatch.maxVolunteerCount || "không giới hạn"} tình nguyện viên.`;
          } else if (
            campaignDetailKeywords.supportType.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Loại hình hỗ trợ của chiến dịch "${bestMatch.title}": ${bestMatch.supportType || "Không có thông tin"}.`;
          } else if (
            campaignDetailKeywords.bankInfo.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Chiến dịch "${bestMatch.title}" nhận hỗ trợ qua ngân hàng ${bestMatch.bankName || "Không có thông tin"}, số tài khoản: ${bestMatch.bankAccount || "Không có thông tin"}.`;
          } else if (
            campaignDetailKeywords.address.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Địa chỉ của chiến dịch "${bestMatch.title}": ${bestMatch.address || "Không có thông tin địa chỉ."}`;
          } else if (
            campaignDetailKeywords.category.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Chiến dịch "${bestMatch.title}" thuộc danh mục: ${bestMatch.category || "Không có thông tin danh mục."}`;
          } else if (
            campaignDetailKeywords.receivingMethod.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Chiến dịch "${bestMatch.title}" có phương thức nhận hỗ trợ là: ${bestMatch.receivingMethod || "Không có thông tin."}`;
          } else if (
            campaignDetailKeywords.totalDonationAmount.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Tổng số tiền quyên góp được cho chiến dịch "${bestMatch.title}" là: ${bestMatch.totalDonationAmount?.toLocaleString("vi-VN") || 0} VND.`;
          } else if (
            campaignDetailKeywords.urgency.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Mức độ khẩn cấp của chiến dịch "${bestMatch.title}" là: ${bestMatch.urgency || "Không có thông tin."}`;
          } else if (
            campaignDetailKeywords.description.some((kw) => normalizedQuestion.includes(removeDiacritics(kw)))
          ) {
            reply = `Mô tả của chiến dịch "${bestMatch.title}": ${bestMatch.description || "Không có mô tả."}`;
          }

          setMessages((prev) => [...prev, { role: "bot", text: reply }]);
          setLoading(false);
          return;
        } else {
          setMessages((prev) => [...prev, { role: "bot", text: "Tôi không tìm thấy chiến dịch bạn hỏi hoặc không đủ thông tin để trả lời." }]);
          setLoading(false);
          return;
        }
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: "Tôi không thể nhận diện tên chiến dịch trong câu hỏi của bạn. Vui lòng thử lại với tên chiến dịch rõ ràng hơn." }]);
        setLoading(false);
        return;
      }
    }

    try {
      const aiReply = await askGemini(question);
      setMessages((prev) => [...prev, { role: "bot", text: aiReply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <motion.div
          key="chatbox"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={styles.chatBox}
        >
          <div className={styles.chatHeader}>
            <span className={styles.robotIcon}>🤖 Trợ lý AI</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className={styles.chatBody} ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user" ? styles.userMessage : styles.botMessage
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className={styles.botMessage}>Đang suy nghĩ...</div>}
          </div>

          <div className={styles.chatInputContainer}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className={styles.chatInputNew}
              onKeyDown={(e) => e.key === "Enter" && handleProcess()}
            />

            <button
              className={styles.sendCircleButton}
              onClick={handleProcess}
              disabled={loading || question.trim() === ""}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sendIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {!isOpen && (
  <motion.button
    onClick={() => setIsOpen(true)}
    className={styles.chatToggleBtn}
    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <Image
      src="/images/robot.png"
      alt="Chat bot"
      width={50}
      height={50}
    />
  </motion.button>
)}

    </div>
  );
}