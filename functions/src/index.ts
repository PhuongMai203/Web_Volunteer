import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as nodemailer from "nodemailer";
import admin from "firebase-admin";


admin.initializeApp();
const db = admin.firestore();

// Định nghĩa secrets (set bằng CLI: firebase functions:secrets:set ...)
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");

// Hàm tạo transporter gửi mail
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser.value(),
      pass: emailPass.value(),
    },
  });
}

/* ========== 1. Gửi email từ hàng chờ Firestore ========== */

export const handleRejectionEmail = onDocumentCreated(
  {
    document: "mail/{docId}",
    secrets: [emailUser, emailPass],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.log("⚠️ Không có dữ liệu document.");
      return;
    }

    const mailData = snap.data();
    const docRef = snap.ref;
    const transporter = createTransporter();

    try {
      if (!mailData?.to || !mailData?.message) {
        throw new Error("Thiếu trường 'to' hoặc 'message'");
      }

      const mailOptions = {
        from: `"Hệ thống Xác minh" <${emailUser.value()}>`,
        to: mailData.to,
        subject: mailData.message.subject || "Thông báo",
        text: mailData.message.text,
        html: mailData.message.html || mailData.message.text,
      };

      await transporter.sendMail(mailOptions);
      logger.log(`✅ Đã gửi email tới ${mailData.to}`);

      // Thay vì xóa document mail, ta lưu lại vào collection 'email' để lưu lịch sử
      await db.collection("email").add({
        ...mailData,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Xóa document mail gốc nếu muốn, hoặc comment dòng này để giữ nguyên
      // await docRef.delete();
      
    } catch (error: any) {
      logger.error("❌ Lỗi khi gửi email:", error);
      await docRef.update({
        status: "failed",
        error: error.message,
        retries: admin.firestore.FieldValue.increment(1),
        lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/* ========== 2. Hàm helper để thêm email vào hàng chờ ========== */

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> {
  try {
    await db.collection("mail").add({
      to,
      message: { subject, text, html },
      created: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.log(`📨 Đã thêm email vào queue cho: ${to}`);
  } catch (error) {
    logger.error("❌ Lỗi khi thêm email vào hàng chờ:", error);
    throw error;
  }
}

/* ========== 3. Vô hiệu hóa tài khoản người dùng ========== */

export const disableUser = onCall(
  {
    secrets: [emailUser, emailPass],
    enforceAppCheck: true,
  },
  async (request) => {
    const userId = request.data.userId;

    if (!request.auth) {
      throw new Error("Unauthenticated request");
    }

    try {
      await admin.auth().updateUser(userId, { disabled: true });
      return { success: true };
    } catch (error) {
      logger.error("❌ Lỗi khi vô hiệu hóa người dùng:", error);
      throw new Error("INTERNAL");
    }
  }
);

/* ========== 4. Cấp quyền admin và gửi thông báo xác minh ========== */

export const setAdminRole = onCall(
  {
    secrets: [emailUser, emailPass],
    enforceAppCheck: true,
  },
  async (request) => {
    const { businessName, ownerName, docId } = request.data;
    const auth = request.auth;

    if (!auth?.token?.admin) {
      throw new Error("Permission denied");
    }

    const adminEmails = ["admin1@gmail.com", "admin2@gmail.com"];

    try {
      for (const email of adminEmails) {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

        await db.collection("adminLogs").add({
          action: "GRANT_ADMIN",
          targetUserId: userRecord.uid,
          executor: auth.uid,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const payload = {
        notification: {
          title: "🔔 Yêu cầu xác minh mới",
          body: `${businessName || "Doanh nghiệp"} - ${ownerName || "Chủ sở hữu"}`,
        },
        data: {
          screen: "business_verification_detail",
          businessId: docId || "",
        },
      };

      const tokensSnapshot = await db.collection("adminTokens").get();
      const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter(Boolean);

      if (tokens.length > 0) {
        await admin.messaging().sendToDevice(tokens, payload);
      }

      return { message: "Cấp quyền admin thành công" };
    } catch (error) {
      logger.error("❌ Lỗi khi cấp quyền admin:", error);
      throw new Error("INTERNAL");
    }
  }
);

/* ========== 5. Xóa tài khoản hết hạn ========== */

export const deleteExpiredAccounts = onSchedule(
  "every 24 hours",
  async () => {
    const usersRef = db.collection("users");
    const now = admin.firestore.Timestamp.now();

    const expiredUsers = await usersRef
      .where("scheduledDeleteAt", "<=", now)
      .get();

    if (expiredUsers.empty) {
      logger.log("✅ Không có tài khoản hết hạn cần xóa.");
      return;
    }

    const deletePromises = expiredUsers.docs.map(async (doc) => {
      const uid = doc.id;
      logger.log(`🗑️ Đang xóa tài khoản UID: ${uid}`);

      try {
        await admin.auth().deleteUser(uid);
        await doc.ref.delete();
        logger.log(`✅ Đã xóa tài khoản UID: ${uid}`);
      } catch (error) {
        logger.error(`❌ Lỗi khi xóa UID ${uid}:`, error);
      }
    });

    await Promise.all(deletePromises);
    logger.log("✅ Đã xử lý xong việc xóa tài khoản hết hạn.");
  }
);
