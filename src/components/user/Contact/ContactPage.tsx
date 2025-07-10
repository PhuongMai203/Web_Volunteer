"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { getMessagesBetween, saveMessage } from "@/lib/firebase/getMessages";
import { getUserInfoFromFirestore } from "@/lib/firebase/getUserInfo";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../../../styles/Contact/ContactPage.module.css";
import Image from "next/image";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

interface Message {
  id: string;
  from: "user" | "partner";
  content: string;
  time: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread?: number;
}

interface FirestoreMessage {
  message: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp;
  participants: string[];
}

export default function ContactPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [hasMounted, setHasMounted] = useState(false);

  const userInfo = typeof window !== "undefined" ? localStorage.getItem("userInfo") : null;
  const myId = userInfo ? JSON.parse(userInfo).uid : "";

  const fetchUsers = useCallback(async () => {
    try {
      const q = query(collection(db, "messages"), where("participants", "array-contains", myId));
      const snap = await getDocs(q);

      const userMap = new Map<string, User>();

      for (const doc of snap.docs) {
        const data = doc.data() as FirestoreMessage;
        const partnerId = data.senderId === myId ? data.receiverId : data.senderId;

        if (!userMap.has(partnerId)) {
          const partnerInfo = await getUserInfoFromFirestore(partnerId);
          if (partnerInfo) {
            userMap.set(partnerId, {
              id: partnerInfo.id,
              name: partnerInfo.name,
              avatar: partnerInfo.avatarUrl,
              lastMessage: data.message,
              lastMessageTime: data.timestamp.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              unread: 0,
            });
          }
        }
      }

      setUsers(Array.from(userMap.values()));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người trò chuyện:", err);
    }
  }, [myId]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!myId) return;

    socket.emit("join", myId);
    fetchUsers();

    socket.on("receive_message", (data) => {
      const { senderId, receiverId, message, timestamp } = data;
      const partnerId = senderId === myId ? receiverId : senderId;

      if (selectedUser?.id === partnerId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            from: senderId === myId ? "user" : "partner",
            content: message,
            time: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === partnerId
            ? {
                ...u,
                lastMessage: message,
                lastMessageTime: "Vừa xong",
                unread: selectedUser?.id === partnerId ? 0 : (u.unread || 0) + 1,
              }
            : u
        )
      );
    });

    return () => {
      socket.off("receive_message");
    };
  }, [myId, selectedUser, fetchUsers]);

  const loadMessages = async (partnerId: string) => {
    if (!myId) return;
    const chatData = await getMessagesBetween(myId, partnerId);

    const formatted = chatData.map((m: FirestoreMessage) => ({
      id: m.timestamp?.seconds?.toString() || Date.now().toString(),
      from: m.senderId === myId ? "user" as const : "partner" as const,
      content: m.message,
      time: m.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "",
    }));

    setMessages(formatted);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    loadMessages(user.id);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, unread: 0 } : u
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !myId) return;

    const firestoreTimestamp = Timestamp.now();
    const displayTime = new Date();

    const msgData = {
      senderId: myId,
      receiverId: selectedUser.id,
      message: newMessage,
      timestamp: firestoreTimestamp,
      participants: [myId, selectedUser.id],
    };

    socket.emit("send_message", {
      senderId: myId,
      receiverId: selectedUser.id,
      message: newMessage,
      timestamp: displayTime,
    });

    await saveMessage(msgData);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        from: "user",
        content: newMessage,
        time: displayTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, lastMessage: newMessage, lastMessageTime: "Vừa xong" }
          : u
      )
    );

    setNewMessage("");
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <h2 className={styles.title}>💬 Trò chuyện</h2>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.userItemSelected : ""}`}
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={40}
                height={40}
                className={styles.avatar}
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className={styles.userName}>{user.name}</p>
                  <span className={styles.userTime}>{user.lastMessageTime}</span>
                </div>
                <p className={styles.userMessage}>
                  {user.lastMessage}
                  {user.unread ? <span className={styles.unreadBadge}>{user.unread}</span> : null}
                </p>
              </div>
            </div>
          ))}
        </aside>

        <main className={styles.chatArea}>
          {selectedUser ? (
            <>
              <header className={styles.chatHeader}>
                <Image
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  width={40}
                  height={40}
                  className={styles.chatAvatar}
                />
                <div>
                  <p className={styles.chatUserName}>{selectedUser.name}</p>
                  <p className={styles.activeStatus}>Đang hoạt động</p>
                </div>
              </header>

              <div className={styles.messageList}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.messageWrapper} ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`${styles.messageContent} ${msg.from === "user" ? styles.messageUser : styles.messagePartner}`}
                    >
                      <p>{msg.content}</p>
                      <p className={styles.messageTime}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <footer className={styles.footer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className={styles.textarea}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`${styles.sendButton} ${newMessage.trim() ? styles.sendButtonActive : styles.sendButtonDisabled}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </footer>
            </>
          ) : (
            <div className={styles.emptyState}>Chọn một người để bắt đầu trò chuyện</div>
          )}
        </main>
      </div>
    </div>
  );
}
