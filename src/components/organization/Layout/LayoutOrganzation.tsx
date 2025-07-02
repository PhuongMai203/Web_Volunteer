'use client';
import React, { useState } from "react";
import Header from "./Header";
import SidebarOrg from "./SidebarOrganzation";
import Footer from "@/components/user/Layout/Footer";
import styles from "@/styles/admin/AdminDashboard.module.css";

interface LayoutOrgProps {
  children: React.ReactNode;
}

export default function LayoutOrg({ children }: LayoutOrgProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={styles.contentWrapper}>
        <SidebarOrg sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
