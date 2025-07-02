import styles from "../../../../styles/notification/event.module.css";
import { CalendarDays, Megaphone } from "lucide-react";

interface Event {
  id: string;
  title: string;
  startDate: string; 
}

interface Props {
  event: Event;
  isNew: boolean;
}

export default function EventNotificationItem({ event, isNew }: Props) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const expired = startDate < now;

  const formatDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  const calculateRemainingDays = (date: Date) =>
    Math.max(0, Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const remainingDays = calculateRemainingDays(startDate);

  return (
    <div className={styles.notificationWrapper}>
      <div className={styles.listTile}>
        <Megaphone className={styles.icon} size={28} />

        <div className={styles.textGroup}>
          <h3 className={styles.title}>{event.title}</h3>

          {expired ? (
            <p className={styles.completedText}>Đã hoàn thành</p>
          ) : remainingDays === 2 ? (
            <p className={styles.specialNotice}>
              Chiến dịch {event.title} bắt đầu sau 2 ngày nữa
            </p>
          ) : (
            <p className={styles.remainingText}>
              Còn lại: {remainingDays} ngày
            </p>
          )}

          <p className={styles.startDate}>
            <CalendarDays size={12} className="mr-1" />
            Ngày bắt đầu: {formatDate(startDate)}
          </p>
        </div>
      </div>

      {isNew && !expired && <div className={styles.newIndicator} />}
    </div>
  );
}
