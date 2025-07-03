'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaUsers, FaCog, FaChartBar, FaCommentDots, FaBullhorn } from 'react-icons/fa';
import styles from '@/styles/admin/SidebarAdmin.module.css';

interface SidebarAdminProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function SidebarAdmin({ sidebarOpen, setSidebarOpen }: SidebarAdminProps) {
  const pathname = usePathname() || "";

  const menuItems = [
    { id: 1, name: 'Bảng Điều Khiển', icon: <FaHome />, href: '/admin/dashboard' },
    { id: 2, name: 'Quản Lý Người Dùng', icon: <FaUsers />, href: '/admin/users' },
    { id: 3, name: 'Quản Lý Chiến Dịch', icon: <FaBullhorn />, href: '/admin/campaigns' },
    { id: 4, name: 'Cài Đặt Hệ Thống', icon: <FaCog />, href: '/admin/settings' },
    { id: 5, name: 'Thống Kê', icon: <FaChartBar />, href: '/admin/statistics' },
    { id: 6, name: 'Nhắn Tin', icon: <FaCommentDots />, href: '/admin/contactInfo' },
  ];

  return (
    <>
      <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>

        <div className={styles.menuWrapper}>
          <h2 className={styles.menuTitle}>Menu Quản Trị</h2>
        </div>

        <div className={styles.navList}>
          {menuItems.map(item => (
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
