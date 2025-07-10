"use client";

import { useEffect, useState } from "react";
import { getAllUsers, UserData } from "@/lib/firebase/getUsers";
import styles from "@/styles/Home/FeaturedFaces.module.css";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";

export default function FeaturedFaces() {
  const [people, setPeople] = useState<UserData[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      AOS.init({ duration: 800, once: true });
    }
  }, [hasMounted]);

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await getAllUsers();
      const vipUsers = allUsers.filter((user) => user.rank === "VIP");
      setPeople(vipUsers);
    };
    fetchData();
  }, []);

  const getRankClass = (rank: string) => {
    switch (rank) {
      case "VIP":
        return styles.rankVIP;
      case "Vàng":
        return styles.rankVang;
      case "Bạc":
        return styles.rankBac;
      default:
        return styles.rankDefault;
    }
  };

  if (!hasMounted) return null;

  return (
    <div className={styles.featureBox} data-aos="zoom-in-up">
      <h3 className={styles.heading}>🌟 Gương mặt nổi bật</h3>
      <div className={styles.scrollContainer}>
        <div className={styles.peopleRow}>
          {people.length > 0 ? (
            people.map((person, idx) => {
              const avatarSrc =
                typeof person.avatarUrl === "string" && person.avatarUrl.trim() !== ""
                  ? person.avatarUrl
                  : "/images/default_avatar.jpg";

              const altText =
                typeof person.name === "string" && person.name.trim() !== ""
                  ? person.name
                  : "Không rõ";

              const displayName =
                typeof person.name === "string" && person.name.trim() !== ""
                  ? person.name
                  : "Chưa có tên";

              const rankLabel =
                typeof person.rank === "string" && person.rank.trim() !== ""
                  ? person.rank
                  : "Không xác định";

              return (
                <div
                  key={person.id || idx}
                  className={styles.personCard}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className={styles.personAvatar}>
                    <Image
                      src={avatarSrc}
                      alt={altText}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <h4 className={styles.personName}>{displayName}</h4>
                  <div
                    className={`${styles.rankBadge} ${getRankClass(
                      getRankClass(typeof person.rank === "string" ? person.rank : "")
                    )}`}
                  >
                    {rankLabel}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyMessage}>Không có người dùng VIP nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
