"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import NotificationIcon from "@/components/user/sub/notification/NotificationIcon";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { HiMenu } from "react-icons/hi";

import { Agbalumo } from "next/font/google";
import styles from '@/styles/Home/Header.module.css';
import CampaignFilter from "@/components/user/Layout/sub/Filter";

const agbalumo = Agbalumo({ subsets: ["latin"], weight: "400" }); 

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.innerContainer}>

        {/* Logo and Welcome Message */}
        <div className={styles.logoWelcomeSection}>
          <div className={styles.logoWrapper}>
            <div className={styles.imageContainer}>
              <Image
                src="/images/logo.jpg"
                alt="HelpConnect logo"
                fill
                className={styles.logoImage}
              />
            </div>
          </div>

          <div className={styles.welcomeTextGroup}>
            <span className={`${agbalumo.className} ${styles.welcomeGreeting}`}>
              Chào mừng
            </span>
            <span className={`${agbalumo.className} ${styles.welcomeReturn}`}>
              Tình nguyện viên trở lại
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={`hidden md:flex ${styles.navContainer}`}>
          <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.activeNavLink : ""}`}>
            Trang chủ
          </Link>
          <Link href="/campaigns" className={`${styles.navLink} ${pathname === "/campaigns" ? styles.activeNavLink : ""}`}>
            Bảng tin
          </Link>
          <Link href="/contact" className={`${styles.navLink} ${pathname === "/contact" ? styles.activeNavLink : ""}`}>
            Liên hệ
          </Link>
          <Link href="/account" className={`${styles.navLink} ${pathname === "/account" ? styles.activeNavLink : ""}`}>
            Tài khoản
          </Link>
        </nav>

        {/* Icons + Mobile Menu Toggle */}
        <div className={styles.iconGroup}>
          <CampaignFilter
            onFilterChange={(filterType) => {
              const params = new URLSearchParams(window.location.search);
              params.set("sort", filterType); 
              router.push(`${pathname}?${params.toString()}`);
            }}
          />

          {userId && <NotificationIcon userId={userId} />}

          {/* Menu Toggle only on mobile */}
          <div className={styles.menuToggle} onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <HiMenu />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={styles.mobileMenu}>
          <Link href="/" onClick={() => setShowMobileMenu(false)} className={styles.mobileLink}>
            Trang chủ
          </Link>
          <Link href="/campaigns" onClick={() => setShowMobileMenu(false)} className={styles.mobileLink}>
            Bảng tin
          </Link>
          <Link href="/contact" onClick={() => setShowMobileMenu(false)} className={styles.mobileLink}>
            Liên hệ
          </Link>
          <Link href="/account" onClick={() => setShowMobileMenu(false)} className={styles.mobileLink}>
            Tài khoản
          </Link>
        </div>
      )}
    </header>
  );
}
