"use client";

import { useState } from "react";
import { User, MapPin, MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import styles from "@/styles/Home/SupportForm.module.css";

export default function SupportForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Vui lòng đăng nhập trước khi gửi yêu cầu.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "support_requests"), {
        ...form,
        userId: user.uid,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      alert("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.");
      setForm({ name: "", phone: "", address: "", description: "" });
    } catch (error) {
      console.error(error);
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.supportSection}>
      <h2 className={styles.sectionHeading}>Hỗ trợ & Giải đáp</h2>

      <div className={styles.sectionContent}>
        <div className={styles.leftCol}>
          <div className={styles.leftHeading}>
            <span>❓</span>
            <h2>Bạn cần giúp đỡ?</h2>
          </div>
          <div className={styles.questionList}>
            {[
              "Làm sao để tham gia chiến dịch?",
              "Làm sao để đăng ký tài khoản tình nguyện viên?",
              "Làm sao để theo dõi trạng thái hỗ trợ?",
              "Tôi cần hỗ trợ kỹ thuật, tôi nên làm gì?",
            ].map((q, i) => (
              <div key={i} className={styles.questionItem}>
                <span>💬</span>
                <p>{q}</p>
              </div>
            ))}
          </div>
          <p className={styles.note}>Nếu bạn có câu hỏi khác, đừng ngần ngại gửi yêu cầu ở bên phải nhé!</p>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.supportBox}>
            <h3>📩 Gửi yêu cầu hỗ trợ</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.icon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Tên của bạn"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.icon} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputWrapper}>
                <MapPin size={18} className={styles.icon} />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputWrapper}>
                <MessageCircle size={18} className={`${styles.icon} ${styles.iconTop}`} />
                <textarea
                  name="description"
                  placeholder="Nội dung cần hỗ trợ"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  required
                  className={styles.textAreaField}
                />
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
