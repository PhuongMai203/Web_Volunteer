"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon, GroupIcon } from "lucide-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import styles from "@/styles/admin/CampaignTable.module.css";
import { Activity } from "@/components/types/activity";

interface CampaignTableProps {
  activities: Activity[];
  onDelete: (id: string) => void;
  onEdit: (activity: Activity) => void;
}

export default function CampaignTable({ activities, onDelete, onEdit }: CampaignTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(activities.length / itemsPerPage);

  const getStatus = (startDateRaw: string | Date, endDateRaw?: string | Date) => {
    const now = new Date();
    const startDate = typeof startDateRaw === "string" ? new Date(startDateRaw) : startDateRaw;
    const endDate = endDateRaw ? (typeof endDateRaw === "string" ? new Date(endDateRaw) : endDateRaw) : undefined;

    if (startDate > now) return "upcoming";
    if (startDate <= now && endDate && endDate >= now) return "active";
    return "completed";
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = activities.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Chiến dịch</th>
            <th className={styles.th}>Ngày diễn ra</th>
            <th className={styles.th}>Tình nguyện viên</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Tiến độ</th>
            <th className={styles.th} style={{ textAlign: "right" }}>Hành động</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {paginatedActivities.map((activity) => {
            const status = getStatus(activity.startDate, activity.endDate);
            const progress = Math.min(Math.round((activity.participantCount / (activity.maxVolunteerCount || 1)) * 100), 100);
            const startDateFormatted = new Date(activity.startDate).toLocaleDateString("vi-VN");

            return (
              <tr key={activity.id} className={styles.trHover}>
                <td className={styles.td}>
                  <div className={styles.name}>{activity.name}</div>
                  <div className={styles.title}>{activity.title}</div>
                </td>
                <td className={styles.td}>{startDateFormatted}</td>
                <td className={`${styles.td} ${styles.volunteer}`}>
                  <GroupIcon className={styles.volunteerIcon} />
                  <span className="font-medium">{activity.participantCount}</span>
                </td>
                <td className={styles.td}>
                  <StatusBadge status={status} />
                </td>
                <td className={styles.td}>
                  <ProgressBar progress={progress} />
                </td>
                <td className={`${styles.td} ${styles.actionCell}`}>
                  <button onClick={() => onEdit(activity)} className={styles.editBtn}>
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(activity.id)} className={styles.deleteBtn}>
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {activities.length === 0 && (
        <div className={styles.empty}>Không tìm thấy chiến dịch nào</div>
      )}

      {/* Phân trang */}
      {activities.length > 0 && (
        <div className={styles.tableFooter}>
          <div className={styles.tableInfo}>
            Hiển thị {activities.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, activities.length)} của {activities.length} kết quả
          </div>
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaArrowLeft />
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`${styles.pageButton} ${
                  currentPage === index + 1 ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
