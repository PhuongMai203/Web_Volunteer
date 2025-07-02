import { useRouter } from "next/navigation";
import styles from "../../../../styles/notification/rank.module.css";

interface Props {
  newRank: string;
  isNew?: boolean;
}

export default function RankNotificationItem({ newRank, isNew }: Props) {
  const router = useRouter();

  return (
    <div
      className={`${styles.notificationWrapper} ${isNew ? styles.newNotification : ""}`}
      onClick={() => router.push("/account/rank")}
    >
      <span className={styles.icon}>🎉</span>
      <span className={styles.text}>
        Chúc mừng bạn đã đạt danh hiệu mới! Danh hiệu của bạn là:{" "}
        <strong>{newRank}</strong>
      </span>
    </div>
  );
}