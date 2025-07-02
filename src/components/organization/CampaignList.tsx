"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "../../styles/organization/Dashboard.module.css";

interface CampaignListProps {
  userId: string | null;
  onSelectCampaign: (campaign: any) => void;
}

const categories = [
  "Xóa đói", "Trẻ em", "Người cao tuổi", "Người nghèo", "Người khuyết tật",
  "Bệnh hiểm nghèo", "Dân tộc thiểu số", "Lao động di cư", "Người vô gia cư",
  "Môi trường", "Xóa nghèo", "Thiên tai", "Giáo dục"
];

export default function CampaignList({ userId, onSelectCampaign }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (userId) fetchCampaigns(userId);
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [campaigns, categoryFilter, startDateFilter, endDateFilter, searchTerm]);

  const fetchCampaigns = async (uid: string) => {
    const q = query(collection(db, "featured_activities"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate() || null,
      endDate: doc.data().endDate?.toDate() || null
    }));
    setCampaigns(data);
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      filtered = filtered.filter(c => c.startDate && new Date(c.startDate) >= startDate);
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      filtered = filtered.filter(c => c.endDate && new Date(c.endDate) <= endDate);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  };

  const formatDate = (date: Date) => date ? date.toLocaleDateString("vi-VN") : "N/A";

  const getProgress = (participantCount: number, maxVolunteerCount: number) => {
    if (!maxVolunteerCount) return "0%";
    const percent = (participantCount / maxVolunteerCount) * 100;
    return `${Math.min(percent, 100).toFixed(0)}%`;
  };

  if (campaigns.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Bạn chưa có chiến dịch nào. Hãy tạo chiến dịch mới!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          className={styles.dateInput}
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
        />

        <input
          type="date"
          className={styles.dateInput}
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.cardGrid}>
        {filteredCampaigns.map(item => (
          <div key={item.id} className={styles.campaignCard} onClick={() => onSelectCampaign(item)}>
            <div className={styles.cardImageWrapper}>
              <img src={item.imageUrl || "/images/default_campaign.jpg"} alt={item.title} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p><strong>Danh mục:</strong> {item.category}</p>
              <p><strong>Ngày bắt đầu:</strong> {formatDate(item.startDate)}</p>
              <p><strong>Địa chỉ:</strong> {item.address}</p>
              <p><strong>Độ khẩn cấp:</strong> {item.urgency}</p>
              <p><strong>Tiến độ:</strong> {getProgress(item.participantCount, item.maxVolunteerCount)}</p>
              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBar}
                  style={{ width: getProgress(item.participantCount, item.maxVolunteerCount) }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
