import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Hàm gửi email vào collection 'mail'
 */
async function sendEmail(to: string, subject: string, plainText: string) {
  const htmlContent = plainText.replace(/\n/g, "<br>");
  const mailData = {
    to,
    message: {
      subject,
      text: plainText,
      html: htmlContent,
    },
  };

  try {
    const docRef = await addDoc(collection(db, "mail"), mailData);
  } catch (error) {
  }
}

/**
 * Lấy thông tin người dùng và hồ sơ xác minh
 */
async function getVerificationData(verificationId: string) {
  const verRef = doc(db, "businessVerifications", verificationId);
  const verSnap = await getDoc(verRef);

  if (!verSnap.exists()) {
    throw new Error("Hồ sơ không tồn tại");
  }

  const data = verSnap.data();
  const userEmail = (data?.userEmail || "").trim();
  const userId = (data?.userId || "").trim();
  const submittedAt = data?.submittedAt?.toDate ? data.submittedAt.toDate() : null;

  if (!userEmail || !userId) {
    throw new Error("Thông tin người dùng không hợp lệ");
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Không tìm thấy người dùng");
  }

  const userName = (userSnap.data()?.name || "Quý khách").trim();
  const submittedDateStr = submittedAt ? submittedAt.toLocaleString("vi-VN") : "không xác định";
  return { verRef, userRef, userEmail, userName, submittedDateStr };
}

/**
 * Phê duyệt hồ sơ xác minh doanh nghiệp
 */
export async function approveBusinessVerification(verificationId: string) {

  const { verRef, userRef, userEmail, userName, submittedDateStr } = await getVerificationData(verificationId);
  await updateDoc(userRef, { isApproved: true });
  await updateDoc(verRef, {
    status: "approved",
    reviewedAt: serverTimestamp(),
    rejectionReason: "",
  });


  const plainText = `
Kính chào ${userName},
Chúng tôi đã xem xét yêu cầu xác minh doanh nghiệp của bạn gửi vào ngày ${submittedDateStr}.
Chúc mừng bạn! Yêu cầu đã được PHÊ DUYỆT.
Bạn đã có quyền truy cập đầy đủ và có thể đăng nhập vào ứng dụng ngay từ bây giờ.
Nếu có thắc mắc vui lòng liên hệ: thiennguyen123@gmail.com.
Trân trọng,
Bộ phận Hỗ trợ & Xác minh
`.trim();

  await sendEmail(userEmail, "Thông báo phê duyệt xác minh doanh nghiệp", plainText);
}

/**
 * Từ chối hồ sơ xác minh doanh nghiệp
 */
export async function rejectBusinessVerification(verificationId: string, reason: string) {

  if (!reason.trim()) {
    throw new Error("Vui lòng nhập lý do từ chối");
  }

  const { verRef, userEmail, userName, submittedDateStr } = await getVerificationData(verificationId);

  await updateDoc(verRef, {
    status: "rejected",
    rejectionReason: reason.trim(),
    reviewedAt: serverTimestamp(),
  });


  const plainText = `
Kính chào ${userName},
Chúng tôi đã xem xét yêu cầu xác minh doanh nghiệp của bạn gửi vào ngày ${submittedDateStr}.
Rất tiếc, sau khi kiểm tra, chúng tôi không thể chấp nhận yêu cầu do:
${reason.trim()}
Vui lòng kiểm tra lại thông tin và gửi yêu cầu mới.
Trân trọng,
Bộ phận Hỗ trợ & Xác minh
`.trim();

  await sendEmail(userEmail, "Thông báo từ chối xác minh", plainText);
}
