'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaCog, FaChartBar, FaCommentDots, FaBullhorn } from 'react-icons/fa';
import styles from '@/styles/admin/SidebarAdmin.module.css';

interface SidebarOrganzationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function SidebarOrganzation({ sidebarOpen, setSidebarOpen }: SidebarOrganzationProps) {
  const pathname = usePathname() || '';

  const menuItems = [
    { id: 1, name: 'Chiến Dịch Của Tôi', icon: <FaBullhorn />, href: '/organization/dashboard' },
    { id: 2, name: 'Tạo Chiến Dịch', icon: <FaCog />, href: '/organization/createCampaign' },
    { id: 3, name: 'Nhắn Tin', icon: <FaCommentDots />, href: '/organization/contactInfo' },
    { id: 4, name: 'Thống Kê', icon: <FaChartBar />, href: '/organization/statistics' },
    { id: 5, name: 'Tài Khoản', icon: <FaUser />, href: '/organization/account' },
  ];

  return (
    <>
      <nav className={`${styles.sidebar} ${sidebarOpen ? styles.show : styles.hide}`}>
        <div className={styles.menuWrapper}>
          <h2 className={styles.menuTitle}>Menu</h2>
        </div>

        <div className={styles.navList}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navItemActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={`${styles.navIcon} ${pathname.startsWith(item.href) ? styles.navIconActive : ''}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className={styles.systemStatus}>
          <h3 className={styles.systemStatusTitle}>Trạng thái hệ thống</h3>
          <div className={styles.systemStatusContent}>
            <div className={styles.statusDot}></div>
            <span className={styles.statusText}>Hoạt động bình thường</span>
          </div>
        </div>
      </nav>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}
    </>
  );
}
