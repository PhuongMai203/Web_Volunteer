'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import styles from "@/styles/admin/HeaderAdmin.module.css";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-toastify";

interface HeaderAdminProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  adminData: {
    name: string;
    email: string;
  };
}

export default function HeaderAdmin({ sidebarOpen, setSidebarOpen, adminData }: HeaderAdminProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userInfo");
      localStorage.removeItem("accountPageData");
      toast.success("Bạn đã đăng xuất thành công!");
      window.location.href = "/account";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất.");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars />
        </button>
        <div className={styles.logoWrapper}>
          <Image src="/images/logo.jpg" alt="Logo" width={48} height={48} className={styles.logoImage} />
        </div>
        <h1 className={styles.title}>Trung Tâm Quản Trị</h1>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.greeting}>Xin chào, {adminData.name}</span>
        <div className={styles.avatarWrapper} ref={wrapperRef}>
          <div 
            className={styles.avatar} 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {adminData.name.charAt(0).toUpperCase()}
          </div>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownInfo}>
                <p className={styles.dropdownName}>{adminData.name}</p>
                <p className={styles.dropdownEmail}>{adminData.email}</p>
              </div>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <FaSignOutAlt className={styles.dropdownIcon} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
