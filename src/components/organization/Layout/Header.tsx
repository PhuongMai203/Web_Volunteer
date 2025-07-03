'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaBars, FaBell } from 'react-icons/fa';
import styles from "@/styles/admin/HeaderAdmin.module.css";
import NotificationPopup from "../Sub/NotificationPopup";

interface HeaderAdminProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function HeaderAdmin({ sidebarOpen, setSidebarOpen }: HeaderAdminProps) {
  const [showNotification, setShowNotification] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Ẩn thông báo khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowNotification(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>

        <div className={styles.logoWrapper}>
          <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className={styles.logoImage} />
        </div>
        <h1 className={styles.title}>Trung Tâm Quản Trị</h1>
      </div>

      <div className={styles.rightSection} ref={wrapperRef}>
        <div className={styles.notificationWrapper} onClick={() => setShowNotification(!showNotification)}>
          <FaBell className={styles.notificationIcon} />
        </div>

        {showNotification && (
          <NotificationPopup onClose={() => setShowNotification(false)} />
        )}
         <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars />
        </button>
      </div>
      
    </header>

  );
}
