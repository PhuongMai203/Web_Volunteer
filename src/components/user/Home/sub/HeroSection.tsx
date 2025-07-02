"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../../../styles/Home/sub/HeroSection.module.css";
import { getSystemSettings } from "@/lib/firebase/systemSettingsService";

export default function HeroSection() {
  const [hasMounted, setHasMounted] = useState(false);
  const [hotline, setHotline] = useState("+84 986 556 032"); // Giá trị mặc định
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);

    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings?.generalInfo?.hotline) {
        setHotline(settings.generalInfo.hotline);
      }
    };

    fetchSettings();
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handleDonateClick = () => {
    router.push("/campaigns");
  };

  return (
    <section className={styles.heroSection}>
      {/* Bên trái: 3 ảnh trên 1 hàng */}
      <div className={styles.leftImages}>
        <div className={styles.imageRow}>
          <div className={styles.imageSmall}>
            <Image src="/images/a2.jpg" alt="hero-1" fill className="object-cover" />
          </div>
          <div className={styles.imageLarge}>
            <Image src="/images/a3.jpg" alt="hero-2" fill className="object-cover" />
          </div>
          <div className={styles.imageSmall}>
            <Image src="/images/a1.jpg" alt="hero-3" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Bên phải: nội dung chữ và nút */}
      <div className={styles.rightText}>
        <p className={styles.subheading}>Chào mừng đến với HelpConnect</p>
        <h1 className={styles.heading}>
          Bạn là <span className={styles.highlight}>hy vọng </span>của người khác.
        </h1>
        <p className={styles.description}>
          Hãy tham gia cùng chúng tôi để tạo nên sự khác biệt. Chúng tôi kết nối những người tình nguyện với các cộng đồng đang cần. Mỗi hành động đều có giá trị. Hãy là sự thay đổi mà bạn mong muốn nhìn thấy.
        </p>

        <div className={styles.ctaRow}>
          <button className={styles.donateButton} onClick={handleDonateClick}>
            Quyên góp ngay
          </button>
          <span className={styles.hotline}>📞 {hotline}</span>
        </div>
      </div>
    </section>
  );
}
