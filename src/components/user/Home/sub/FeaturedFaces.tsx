"use client";

import { useEffect, useState } from "react";
import { getAllUsers, UserData } from "@/lib/firebase/getUsers";
import styles from "../../../../styles/Home/CampaignList.module.css";
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

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "VIP":
        return "bg-yellow-400 text-yellow-900";
      case "Vàng":
        return "bg-amber-300 text-amber-900";
      case "Bạc":
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="w-full flex justify-center mb-10" data-aos="zoom-in-up">
      <div className={styles.featureBox + " md:w-5/6"}>
        <h3 className="text-orange-700 text-lg font-bold mb-4">🌟 Gương mặt nổi bật</h3>
        <div className="relative overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-5 min-w-max px-1">
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
                  <h4 className="mt-2 text-sm font-bold text-orange-700">
                    {(person.name as string) || "Chưa có tên"}
                  </h4>
                  <div
                    className={`mt-1 text-xs rounded-full px-2 py-0.5 ${getRankColor(
                      person.rank as string
                    )}`}
                  >
                    {(person.rank as string) || "Không xác định"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">Không có người dùng VIP nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
