"use client";

import { useState } from "react";
import { User, MapPin , MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import styles from "../../../styles/Home/SupportForm.module.css";

export default function SupportForm() {
  const [form, setForm] = useState({ name: "", description: "" , address:"", phone:""});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return; // Chặn nhấn tiếp khi đang gửi

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Vui lòng đăng nhập trước khi gửi yêu cầu.");
    return;
  }

  setIsSubmitting(true); // Bắt đầu gửi

  try {
    await addDoc(collection(db, "support_requests"), {
      name: form.name,
      phone: form.phone,
      address: form.address,
      description: form.description,
      isRead: false,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    alert("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.");
    setForm({ name: "", description: "", address: "", phone: "" });
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
  } finally {
    setIsSubmitting(false); // Cho phép nhấn lại sau khi xong
  }
};
  return (
    <section className={styles.supportSection}>
      <h2 className={styles.sectionHeading}>Hỗ trợ & Giải đáp</h2>

      <div className={styles.sectionContent}>
        {/* Bên trái: Câu hỏi thường gặp */}
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
            ].map((question, idx) => (
              <div key={idx} className={styles.questionItem}>
                <span>💬</span>
                <p>{question}</p>
              </div>
            ))}
          </div>

          <p className={styles.note}>
            Nếu bạn có bất kỳ câu hỏi nào khác, đừng ngần ngại gửi yêu cầu ở bên phải nhé!
          </p>
        </div>

        {/* Bên phải: Form hỗ trợ */}
        <div className={styles.rightCol}>
          <div className={styles.supportBox}>
            <h3>📩 Gửi yêu cầu hỗ trợ</h3>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Tên */}
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.icon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Tên của bạn"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.icon} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>

              {/* Địa chỉ */}
              <div className={styles.inputWrapper}>
                <MapPin size={18} className={styles.icon} />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={form.address}
                  onChange={handleChange}
                  className={styles.inputField}
                  required
                />
              </div>


              {/* Nội dung */}
              <div className={styles.inputWrapper}>
                <MessageCircle size={18} className={`${styles.icon} ${styles.iconTop}`} />
                <textarea
                  name="description"
                  placeholder="Nội dung cần hỗ trợ"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className={styles.textAreaField}
                  required
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
