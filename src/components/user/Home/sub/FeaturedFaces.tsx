"use client";

import { useEffect, useState } from "react";
import { getAllUsers, UserData } from "@/lib/firebase/getUsers";
import styles from "@/styles/Home/FeaturedFaces.module.css";
import Image from "next/image";

export default function FeaturedFaces() {
  const [people, setPeople] = useState<UserData[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  if (!hasMounted) {
    return null;
  }

  return (
    <div className={styles.featureBox} data-aos="zoom-in-up">
      <h3 className={styles.heading}>🌟 Gương mặt nổi bật</h3>
      <div className={styles.scrollContainer}>
        <div className={styles.peopleRow}>
          {people.length > 0 ? (
            people.map((person, idx) => (
              <div
                key={person.id || idx}
                className={styles.personCard}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className={styles.personAvatar}>
                  <Image
                    src={(person.avatarUrl as string) || "/images/default_avatar.jpg"}
                    alt={(person.name as string) || "Không rõ"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h4 className={styles.personName}>
                  {(person.name as string) || "Chưa có tên"}
                </h4>
                <div
                  className={`${styles.rankBadge} ${getRankClass(person.rank as string)}`}
                >
                  {(person.rank as string) || "Không xác định"}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyMessage}>Không có người dùng VIP nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
