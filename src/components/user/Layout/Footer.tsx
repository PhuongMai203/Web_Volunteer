"use client";

import Link from "next/link";
import styles from "../../../styles/Home/Footer.module.css";
import { useEffect, useState } from "react";
import { getSystemSettings } from "@/lib/firebase/systemSettingsService";

export default function Footer() {
  const [email, setEmail] = useState("thiennguyen123@gmail.com"); // giá trị mặc định
  const [hotline, setHotline] = useState("1900 9999"); // giá trị mặc định

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings?.generalInfo) {
        setEmail(settings.generalInfo.email || "thiennguyen123@gmail.com");
        setHotline(settings.generalInfo.hotline || "1900 9999");
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.title}>ThienNguyen</h3>
          <p className={styles.description}>
            Nền tảng kết nối tình nguyện viên với các hoạt động cộng đồng khắp Việt Nam.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Liên kết nhanh</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Trang chủ</Link></li>
            <li><Link href="/campaigns">Chiến dịch</Link></li>
            <li><Link href="/about">Về chúng tôi</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Liên hệ</h4>
          <p>Email: {email}</p>
          <p>Hotline: {hotline}</p>
          <p>Địa chỉ: 168 Bạch Đằng, phường 14, quận Bình Thạnh, TP. Hồ Chí Minh</p>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} ThienNguyen. All rights reserved.</p>
      </div>
    </footer>
  );
}
