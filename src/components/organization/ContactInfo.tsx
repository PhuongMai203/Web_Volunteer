"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, Timestamp, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import styles from "../../styles/organization/ContactInfo.module.css";
import io from "socket.io-client";
import { getMessagesBetween, saveMessage } from "@/lib/firebase/getMessages";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Message {
  message: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp;
}

interface ContactInfoProps {
  preSelectedUserId?: string | null;
}

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

export default function ContactInfo({ preSelectedUserId }: ContactInfoProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<{ user: User; lastMessage: string }[]>([]);

  // Lấy uid người dùng hiện tại
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        socket.emit("join", user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Lấy danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"));
        const snap = await getDocs(q);

        const userList: User[] = snap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          avatarUrl: doc.data().avatarUrl,
        }));

        setUsers(userList);
      } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Tự động chọn người khi có userId được truyền vào
  useEffect(() => {
    if (users.length === 0 || !preSelectedUserId) return;

    const found = users.find((u) => u.id === preSelectedUserId);
    if (found) {
      setSelectedUser(found);
    }
  }, [users, preSelectedUserId]);

  // Load tin nhắn khi chọn người
  const loadMessages = useCallback(async () => {
    if (!selectedUser || !currentUserId) return;
    const msgs = await getMessagesBetween(currentUserId, selectedUser.id);
    setMessages(msgs);
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser, loadMessages]);

  // Load gợi ý nhắn tin
  const loadRecentChats = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const q = query(collection(db, "messages"));
      const snap = await getDocs(q);

      const chatMap: { [partnerId: string]: { message: string; timestamp: Timestamp } } = {};

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(currentUserId)) {
          const partnerId = data.senderId === currentUserId ? data.receiverId : data.senderId;

          if (
            !chatMap[partnerId] ||
            data.timestamp.toMillis() > chatMap[partnerId].timestamp.toMillis()
          ) {
            chatMap[partnerId] = {
              message: data.message,
              timestamp: data.timestamp,
            };
          }
        }
      });

      const chats: { user: User; lastMessage: string }[] = [];

      for (const partnerId of Object.keys(chatMap)) {
        const userDoc = await getDoc(doc(db, "users", partnerId));
        const userData = userDoc.data();

        if (userData) {
          chats.push({
            user: {
              id: partnerId,
              name: userData.name,
              avatarUrl: userData.avatarUrl,
            },
            lastMessage: chatMap[partnerId].message,
          });
        }
      }

      setRecentChats(chats.filter((chat) => chat.user.id !== currentUserId));
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử trò chuyện:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadRecentChats();
  }, [currentUserId, loadRecentChats]);

  // Socket lắng nghe tin nhắn
  useEffect(() => {
    if (!currentUserId) return;

    const handleReceiveMessage = (data: Message) => {
      if (data.senderId === selectedUser?.id || data.receiverId === selectedUser?.id) {
        setMessages((prev) => [...prev, data]);
      }
      loadRecentChats();
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [selectedUser, currentUserId, loadRecentChats]);

  const handleSendMessage = async () => {
    if (message.trim() === "" || !selectedUser || !currentUserId) return;

    const msgData = {
      senderId: currentUserId,
      receiverId: selectedUser.id,
      message,
      timestamp: Timestamp.now(),
      participants: [currentUserId, selectedUser.id].sort(),
    };

    socket.emit("send_message", msgData);
    await saveMessage(msgData);

    setMessages((prev) => [...prev, msgData]);
    setMessage("");
    loadRecentChats();
  };

  return (
    <div className={styles.wrapper}>
      {/* Cột trái */}
      <div className={styles.sidebar}>
        <h2 className={styles.title}>💬 Trò chuyện</h2>
        {loading ? (
          <p className={styles.loading}>Đang tải...</p>
        ) : (
          <div className={styles.userList}>
            {users
              .filter((user) => user.id !== currentUserId)
              .map((user) => (
                <div
                  key={user.id}
                  className={`${styles.userCard} ${selectedUser?.id === user.id ? styles.selected : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <Image
                    src={user.avatarUrl || "/images/default_avatar.jpg"}
                    alt={user.name}
                    width={45}
                    height={45}
                    className={styles.avatar}
                  />
                  <p className={styles.name}>{user.name}</p>
                </div>
              ))}
          </div>
        )}

        {/* Lịch sử trò chuyện gần đây */}
        <div className={styles.recentSection}>
          <h3 className={styles.recentTitle}>Trò chuyện gần đây</h3>
          {recentChats.length === 0 ? (
            <p>Chưa có cuộc trò chuyện nào</p>
          ) : (
            recentChats.map((chat) => (
              <div
                key={chat.user.id}
                className={`${styles.recentChatItem} ${selectedUser?.id === chat.user.id ? styles.selected : ""}`}
                onClick={() => setSelectedUser(chat.user)}
              >
                <Image
                  src={chat.user.avatarUrl || "/images/default_avatar.jpg"}
                  alt={chat.user.name}
                  width={60}
                  height={60}
                  className={styles.recentAvatar}
                />
                <div className={styles.recentChatText}>
                  <p className={styles.recentName}>{chat.user.name}</p>
                  <p className={styles.recentLastMessage}>{chat.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cột phải */}
      <div className={styles.mainContent}>
        {selectedUser ? (
          <div className={styles.chatBox}>
            <div className={styles.chatHeader}>
              <Image
                src={selectedUser.avatarUrl || "/images/default_avatar.jpg"}
                alt={selectedUser.name}
                width={40}
                height={40}
                className={styles.avatar}
              />
              <span className={styles.chatName}>{selectedUser.name}</span>
            </div>

            <div className={styles.messageArea}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.senderId === currentUserId ? styles.myMessage : styles.theirMessage}
                >
                  {msg.message}
                </div>
              ))}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.input}
              />
              <button onClick={handleSendMessage} className={styles.sendButton}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.sendIcon}
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <p>Chọn một người để bắt đầu trò chuyện</p>
        )}
      </div>
    </div>
  );
}
