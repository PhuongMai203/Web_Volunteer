"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../../../styles/organization/DonateTab.module.css";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

interface DonateTabProps {
  campaignId: string;
}

interface Donor {
  id: string;
  name: string;
  amount: number;
}

export default function DonateTab({ campaignId }: DonateTabProps) {
  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    const q = query(
      collection(db, "payments"),
      where("campaignId", "==", campaignId)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().userName,
      amount: doc.data().amount,
    }));
    setDonors(data);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      donors.map((d) => ({
        "Họ tên": d.name,
        "Số tiền quyên góp (VNĐ)": d.amount?.toLocaleString(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachQuyenGop");
    XLSX.writeFile(wb, "DanhSachQuyenGop.xlsx");
  };

  return (
    <div className={styles.participantList}>
      <div className={styles.titleRow}>
        <h3>Người quyên góp ({donors.length})</h3>
        <button className={styles.exportButton} onClick={exportToExcel} title="Xuất Excel">
          <FaFileExcel /> Xuất Excel
        </button>
      </div>

      {donors.length === 0 ? (
        <p>Chưa có ai quyên góp.</p>
      ) : (
        donors.map((d) => (
          <div key={d.id} className={styles.participantItem}>
            <span className={styles.participantName}>{d.name}</span>
            <span className={styles.donationAmount}>
              {d.amount?.toLocaleString()} đ
            </span>
          </div>
        ))
      )}
    </div>
  );
}
