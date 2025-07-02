"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../../../styles/organization/CampaignDetail.module.css";
import { FaCommentDots, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

interface ParticipateTabProps {
  campaignId: string;
  onMessage?: (userId: string) => void;
}

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  userId: string;
  location?: string;
  birthYear?: number;
  phone?: string;
  email?: string;
  attendanceStatus?: string;
}

export default function ParticipateTab({ campaignId, onMessage }: ParticipateTabProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    const q = query(
      collection(db, "campaign_registrations"),
      where("campaignId", "==", campaignId),
      where("participationTypes", "array-contains", "Tham gia tình nguyện trực tiếp")
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      avatarUrl: doc.data().avatarUrl,
      userId: doc.data().userId,
      location: doc.data().location || "",
      birthYear: doc.data().birthYear || "",
      phone: doc.data().phone || "",
      email: doc.data().email || "",
      attendanceStatus: doc.data().attendanceStatus || "",
    }));
    setParticipants(data);
  };

  const handleAttendanceToggle = async (participant: Participant) => {
    const newStatus = participant.attendanceStatus === "Có mặt" ? "Vắng mặt" : "Có mặt";

    try {
      const docRef = doc(db, "campaign_registrations", participant.id);
      await updateDoc(docRef, { attendanceStatus: newStatus });

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id ? { ...p, attendanceStatus: newStatus } : p
        )
      );
    } catch (error) {
      console.error("Lỗi cập nhật điểm danh:", error);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      participants.map((p) => ({
        "Họ tên": p.name,
        "Số điện thoại": p.phone,
        "email": p.email,
        "Năm sinh": p.birthYear,
        "Địa chỉ": p.location,
        "Điểm danh": p.attendanceStatus || "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachThamGia");
    XLSX.writeFile(wb, "DanhSachThamGia.xlsx");
  };

  return (
    <div className={styles.participantList}>
      <div className={styles.titleRow}>
        <h3>Người tham gia ({participants.length})</h3>
        <button className={styles.exportButton} onClick={exportToExcel} title="Xuất Excel">
          <FaFileExcel /> Xuất Excel
        </button>
      </div>

      {participants.length === 0 ? (
        <p>Chưa có ai tham gia trực tiếp.</p>
      ) : (
        participants.map((p) => (
          <div key={p.id} className={styles.participantItem}>
            <input
              type="radio"
              className={styles.attendanceRadio}
              checked={p.attendanceStatus === "Có mặt"}
              onChange={() => handleAttendanceToggle(p)}
            />
            <img
              src={p.avatarUrl || "/images/default_avatar.jpg"}
              alt={p.name}
              className={styles.avatar}
            />
            <div className={styles.nameAndStatus}>
              <span className={styles.participantName}>{p.name}</span>
              {p.attendanceStatus && (
                <div
                  className={`${styles.attendanceStatus} ${
                    p.attendanceStatus === "Có mặt" ? styles.present : styles.absent
                  }`}
                >
                  Điểm danh: {p.attendanceStatus}
                </div>
              )}
            </div>
            <button
              className={styles.messageButton}
              onClick={() => onMessage && onMessage(p.userId)}
              title="Nhắn tin"
            >
              <FaCommentDots />
            </button>

          </div>
        ))
      )}
    </div>
  );
}
