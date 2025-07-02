import styles from '../../../../styles/notification/attendance.module.css';
import { CheckCircle } from 'lucide-react';

interface AttendanceNotification {
  id: string;
  title: string;
}

interface Props {
  notifications: AttendanceNotification[];
}

export default function AttendanceNotificationList({ notifications }: Props) {
  return (
    <div>
      {notifications.map((n) => (
        <div key={n.id} className={styles.notificationItem}>
          <CheckCircle className={styles.icon} size={20} />
          <span>
            Điểm danh thành công chiến dịch &quot;<strong>{n.title}</strong>&quot;, được cộng 10đ thành tích!
          </span>

        </div>
      ))}
    </div>
  );
}
