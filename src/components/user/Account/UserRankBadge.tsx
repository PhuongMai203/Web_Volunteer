import React from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/Account/UserRankBadge.module.css";
import { Medal } from "lucide-react";

interface UserRankBadgeProps {
  rank: string;
}

export default function UserRankBadge({ rank }: UserRankBadgeProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/beautiful-rank"); 
  };

  return (
    <div className={styles.hexagonWrapper} onClick={handleClick}>
      <div className={styles.hexagon}>
        <div className={styles.badgeContent}>
          <div className={styles.iconWrapper}>
            <Medal size={24} className={styles.icon} />
          </div>
          <span className={styles.rankText}>{rank}</span>
        </div>
      </div>
    </div>
  );
}
