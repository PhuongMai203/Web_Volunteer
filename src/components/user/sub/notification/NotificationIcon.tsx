"use client";

import { useEffect, useState } from "react";
import styles from "../../../../styles/notification/NotificationIcon.module.css";
import { Bell } from "lucide-react";
import EventNotificationItem from "./event";
import RankNotificationItem from "./rank";
import AttendanceNotificationList from "./attendance";
import { getUpcomingCampaignNotifications } from "@/lib/firebase/getCampaignRegistrations";
import { getRankNotifications } from "@/lib/firebase/getUserRankHistory";
import { getAttendanceNotifications } from "@/lib/firebase/getCampaignRegistrations";

interface EventNotification {
  id: string;
  title: string;
  startDate: string;
  timestamp: string;
}

interface RankNotification {
  id: string;
  newRank: string;
  timestamp: string;
}

interface AttendanceNotification {
  id: string;
  title: string;
}

interface Props {
  userId: string;
  onClick?: () => void; // Cho phép Header kiểm soát nếu muốn
}

export default function NotificationIcon({ userId, onClick }: Props) {
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [rankNotifications, setRankNotifications] = useState<RankNotification[]>([]);
  const [attendanceNotifications, setAttendanceNotifications] = useState<AttendanceNotification[]>([]);
  const [showList, setShowList] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const saved = localStorage.getItem("seen_notifications");
    if (saved) setSeenIds(JSON.parse(saved));
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;

    const fetchData = async () => {
      const events = await getUpcomingCampaignNotifications(userId);
      const attendance = await getAttendanceNotifications(userId);
      const ranks = await getRankNotifications(userId);

      setEventNotifications(
        events.map(e => ({
          id: e.id,
          title: e.title,
          startDate: typeof e.startDate === "string" ? e.startDate : e.startDate.toISOString(),
          timestamp: typeof e.startDate === "string" ? e.startDate : e.startDate.toISOString(),
        }))
      );

      setAttendanceNotifications(
        attendance.map(a => ({
          id: a.id,
          title: a.title,
        }))
      );

      setRankNotifications(
        ranks.map(r => ({
          id: r.id,
          newRank: r.newRank,
          timestamp: r.timestamp,
        }))
      );
    };

    fetchData();
  }, [userId, hasMounted]);

  const newEventIds = eventNotifications.filter(e => !seenIds.includes(e.id)).map(e => e.id);
  const newRankIds = rankNotifications.filter(r => !seenIds.includes(r.id)).map(r => r.id);
  const newAttendanceIds = attendanceNotifications.filter(a => !seenIds.includes(a.id)).map(a => a.id);

  const totalNew = newEventIds.length + newRankIds.length + newAttendanceIds.length;

  const markAllAsSeen = () => {
    const allIds = [
      ...eventNotifications.map(e => e.id),
      ...rankNotifications.map(r => r.id),
      ...attendanceNotifications.map(a => a.id),
    ];
    const updatedSeen = Array.from(new Set([...seenIds, ...allIds]));
    setSeenIds(updatedSeen);
    localStorage.setItem("seen_notifications", JSON.stringify(updatedSeen));
  };

  if (!hasMounted) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconGroup}>
        <div
          className={styles.iconButton}
          onClick={() => {
            if (onClick) {
              onClick();
            } else {
              const nextState = !showList;
              setShowList(nextState);
              if (nextState) markAllAsSeen();
            }
          }}
        >
          <Bell size={34} />
          {totalNew > 0 && <span className={styles.badge}>{totalNew}</span>}
        </div>
      </div>

      {showList && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            Thông báo ({eventNotifications.length + rankNotifications.length + attendanceNotifications.length})
          </div>

          {eventNotifications.length + rankNotifications.length + attendanceNotifications.length === 0 ? (
            <div className={styles.noNotification}>Không có thông báo.</div>
          ) : (
            <>
              {eventNotifications.map(e => (
                <EventNotificationItem
                  key={e.id}
                  event={e}
                  isNew={!seenIds.includes(e.id)}
                />
              ))}

              {rankNotifications.map(r => (
                <RankNotificationItem
                  key={r.id}
                  newRank={r.newRank}
                  isNew={!seenIds.includes(r.id)}
                />
              ))}

              <AttendanceNotificationList
                notifications={attendanceNotifications.map(a => ({
                  ...a,
                  isNew: !seenIds.includes(a.id),
                }))}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
