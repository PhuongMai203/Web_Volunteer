"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../../styles/Home/Banner.module.css";
import { getSystemSettings } from "@/lib/firebase/systemSettingsService";

export default function Banner() {
  const [isMobile, setIsMobile] = useState(true);
  const [sloganHeader, setSloganHeader] = useState("Kết nối trái tim tình nguyện với cộng đồng cần giúp đỡ");
  const [sloganParagraph, setSloganParagraph] = useState("Cùng chung tay xây dựng một xã hội tốt đẹp hơn. Tìm kiếm chiến dịch, tham gia hoạt động, và lan tỏa yêu thương ngay hôm nay.");
  const router = useRouter();

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings?.generalInfo?.slogan) {
        const slogan = settings.generalInfo.slogan;
        const sentences = slogan.split(".").map((s: string) => s.trim()).filter(Boolean);

        if (sentences.length > 0) {
          setSloganHeader(sentences[0]);
          setSloganParagraph(sentences.slice(1).join(". ") + (sentences.length > 1 ? "." : ""));
        }
      }
    };
    fetchSettings();
  }, []);

  const handleClick = () => {
    router.push("/campaigns");
  };

  return (
    <section className={styles.bannerContainer}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shapeBlue}></div>
        <div className={styles.shapeRed}></div>
      </div>

      <div className={styles.innerContainer}>
        <div className={styles.flexLayout}>
          
          {/* Text content */}
          <div className={styles.textBlock}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.heading}
            >
              {sloganHeader}
            </motion.h1>

            {sloganParagraph && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={styles.paragraph}
              >
                {sloganParagraph}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={styles.buttonWrapper}
            >
              <button className={styles.ctaButton} onClick={handleClick}>
                Khám phá các chiến dịch
              </button>
            </motion.div>
          </div>

          {/* Wave separator */}
          <div className={styles.waveWrapper}>
            <div className={styles.waveLine}>
              <motion.div
                className={styles.fullSizeAbsolute}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <svg
                  viewBox={isMobile ? "0 0 200 10" : "0 0 10 200"}
                  className={styles.fullSize}
                  preserveAspectRatio="none"
                >
                  <path
                    d={
                      isMobile
                        ? "M0,5 C50,8 100,8 150,5 C100,2 50,2 0,5"
                        : "M5,0 C8,50 8,100 5,150 C2,100 2,50 5,0"
                    }
                    fill="none"
                    stroke="#ffb74d"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Image block */}
          <motion.div
            className={styles.imageBlock}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.imageCard}>
              <div
                className={styles.mainImageWrapper}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <Image
                  src="/images/bn2.jpg"
                  alt="heart"
                  className={styles.imageHover}
                  fill
                  style={{ objectFit: "cover", borderRadius: "0.5rem" }}
                />
              </div>

              <div className={styles.thumbnailGrid}>
                <div className={styles.thumbnail} style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src="/images/bn1.jpg"
                    alt="heart"
                    className={styles.imageHover}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.thumbnailAlt} style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src="/images/bn3.jpg"
                    alt="heart"
                    className={styles.imageHover}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.thumbnailAlt2} style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src="/images/banner.jpg"
                    alt="heart"
                    className={styles.imageHover}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
