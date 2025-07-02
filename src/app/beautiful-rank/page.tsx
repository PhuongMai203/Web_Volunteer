"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState, useRef } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import styles from "../../styles/Account/BeautifulRank.module.css";
import Certificate from "../../components/user/Account/Certificate";
import { calculateAndUpdateRank } from "@/lib/firebase/rankService";

interface Rank {
  label: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  color: string;
}

export default function BeautifulRankPage() {
  const [userScore, setUserScore] = useState(0);
  const [userRank, setUserRank] = useState("");
  const [userName, setUserName] = useState("Tình nguyện viên");
  const [progressToNext, setProgressToNext] = useState(0);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserName(userData.name || "Tình nguyện viên");
    }

    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      const settingsSnap = await getDoc(doc(db, "system_settings", "main"));
      const pointSettings = settingsSnap.data()?.pointSettings;

      if (!pointSettings) throw new Error("Chưa cấu hình pointSettings");

      const dynamicRanks: Rank[] = [
        { label: "Đồng", emoji: "🥉", minScore: 0, maxScore: pointSettings.bronze, color: "#A0522D" },
        { label: "Bạc", emoji: "🥈", minScore: pointSettings.bronze + 1, maxScore: pointSettings.silver, color: "#B0B0B0" },
        { label: "Vàng", emoji: "🥇", minScore: pointSettings.silver + 1, maxScore: pointSettings.gold, color: "#FFD700" },
        { label: "Kim cương", emoji: "💎", minScore: pointSettings.gold + 1, maxScore: pointSettings.diamond, color: "#7388C1" },
        { label: "VIP", emoji: "👑", minScore: pointSettings.diamond + 1, maxScore: 999999, color: "#E33539" },
      ];

      setRanks(dynamicRanks);

      fetchRank(dynamicRanks);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu rank:", err);
    }
  };

  const fetchRank = async (dynamicRanks: Rank[]) => {
    try {
      const result = await calculateAndUpdateRank();
      setUserScore(result.score);
      setUserRank(result.rank);

      const currentRankIndex = dynamicRanks.findIndex((r) => r.label === result.rank);
      const nextRank = dynamicRanks[currentRankIndex + 1];

      if (nextRank) {
        const progress =
          (result.score - dynamicRanks[currentRankIndex].minScore) /
          (nextRank.minScore - dynamicRanks[currentRankIndex].minScore);
        setProgressToNext(Math.min(progress, 1));
      } else {
        setProgressToNext(1);
      }

      localStorage.setItem(
        "rankInfo",
        JSON.stringify({
          score: result.score,
          rank: result.rank,
        })
      );
    } catch (err) {
      console.error("Lỗi tính toán rank:", err);
    }
  };

  const exportPDF = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    pdf.save("giay-chung-nhan.pdf");
  };

  const currentRankData =
    ranks.find((r) => r.label === userRank) ||
    { label: "Chưa có hạng", emoji: "❓", color: "#ccc", minScore: 0, maxScore: 0 };

  const nextRank = ranks.find((r) => r.minScore > userScore);

  return (
    <div className={styles.rankPage}>
      <h1 className={styles.heading}>Xếp hạng của bạn</h1>

      <div
        className={styles.rankBadge}
        style={{ backgroundColor: currentRankData.color }}
      >
        <span className={styles.rankEmoji}>{currentRankData.emoji}</span>
        <span className={styles.rankLabel}>{currentRankData.label}</span>
        <span className={styles.rankScore}>{userScore} điểm</span>
      </div>

      {nextRank && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: `${progressToNext * 100}%`,
                backgroundColor: currentRankData.color,
              }}
            ></div>
          </div>
          <p>
            {Math.floor(progressToNext * 100)}% tiến tới {nextRank.label}
          </p>
        </div>
      )}

      <div className={styles.rankList}>
        {ranks.map((rank) => (
          <div key={rank.label} className={styles.rankItem}>
            <span className={styles.rankEmoji}>{rank.emoji}</span>
            <span className={styles.rankName} style={{ color: rank.color }}>
              {rank.label}
            </span>
            <span className={styles.rankRange}>
              {rank.minScore} - {rank.maxScore} điểm
            </span>
          </div>
        ))}
      </div>

      <div className={styles.certificateWrapper} ref={certificateRef}>
        <Certificate
          rankData={{ label: currentRankData.label, emoji: currentRankData.emoji }}
          userScore={userScore}
          userName={userName}
        />
      </div>

      <button onClick={exportPDF} className={styles.exportButton}>
        Xuất giấy chứng nhận
      </button>
    </div>
  );
}
