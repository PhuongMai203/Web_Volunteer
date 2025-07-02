import styles from "../../../styles/Account/Certificate.module.css";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Allura } from "next/font/google";

interface CertificateProps {
  rankData: {
    label: string;
    emoji: string;
  };
  userScore: number;
  userName: string;
}

const allura = Allura({ subsets: ["latin"], weight: ["400"] });

export default function Certificate({ rankData, userScore, userName }: CertificateProps) {
  const today = format(new Date(), "dd/MM/yyyy", { locale: vi });

  return (
    <div className={styles.certificateContainer}>
      <div className={styles.watermark}>CHỨNG NHẬN</div>
      
      <p className={styles.nationalTitle}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
      <p className={styles.nationalSubtitle}>Độc lập - Tự do - Hạnh phúc</p>
      <div className={styles.separator}></div>
      
      <p className={styles.organization}>TỔ CHỨC TÌNH NGUYỆN TOÀN QUỐC</p>

      <p className={styles.awardText}>Trao tặng</p>
      <h2 className={styles.certificateTitle}>GIẤY CHỨNG NHẬN</h2>

      <p className={`${styles.volunteerName} ${allura.className}`}>
        Tình nguyện viên: {userName}
      </p>

      <p className={styles.achievementText}>
        Có thành tích xuất sắc trong công tác và đạt hạng {rankData.emoji} {rankData.label} 
        với tổng số <span className={styles.highlight}>{userScore} điểm</span> đóng góp.
      </p>

      <div className={styles.footer}>
        <div className={styles.leftInfo}>
          <p>Ngày cấp: {today}</p>
          <p>Địa điểm: Hà Nội</p>
        </div>

        <div className={styles.rightInfo}>
          <p className={styles.representativeTitle}>TM. Ban tổ chức</p>
          <p className={styles.representativeRole}>Người đại diện</p>
          <p className={styles.signatureHint}>(Ký, ghi rõ họ tên)</p>
          <div className={styles.signatureContainer}>
            <div className={styles.seal}></div>
            <div className={styles.signature}>
              HelpConnect
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}