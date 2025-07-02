'use client';
import React, { useState } from "react";
import HeaderAdmin from "../Layout/HeaderAdmin";
import SidebarAdmin from "./SidebarAdmin";
import FooterAdmin from "./FooterAdmin";
import styles from "@/styles/admin/AdminDashboard.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminData = {
    email: "admin1@gmail.com",
    name: "admin1",
    role: "admin",
    isApproved: true,
  };

  return (
    <div className={styles.container}>
      <HeaderAdmin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} adminData={adminData} />
      <div className={styles.contentWrapper}>
        <SidebarAdmin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}
