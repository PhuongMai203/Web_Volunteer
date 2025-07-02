"use client";
import { User, MapPin } from "lucide-react";
import styles from "../../../styles/Account/AccountSub.module.css";

interface UserInfo {
  fullName: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthYear: string;
}

interface Props {
  userInfo: UserInfo;
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AccountPersonalInfo({ userInfo, isEditing, handleInputChange }: Props) {
  return (
    <div className={styles.containerInf}>
      <div className={styles.infoHeader}>
        <h2 className={styles.title}>
          <User className={styles.userIcon} size={20} />
          Thông tin cá nhân
        </h2>

      </div>

      <div className={styles.gridContainer}>
        <div className={styles.infoColumn}>
          {/* Họ và tên */}
          <div>
            <label className={styles.label}>Họ và tên</label>
            {isEditing ? (
              <input name="fullName" value={userInfo.fullName} onChange={handleInputChange} className={styles.input} />
            ) : <div className={styles.staticField}>{userInfo.fullName}</div>}
          </div>
          {/* name */}
          <div>
            <label className={styles.label}>Tên đăng nhập</label>
            <div className={`${styles.staticField} ${styles.inlineFlex}`}>
              <span className={styles.grayText}></span>
              {userInfo.name}
            </div>
          </div>
          {/* Email */}
          <div>
            <label className={styles.label}>Email</label>
            {isEditing ? (
              <input type="email" name="email" value={userInfo.email} onChange={handleInputChange} className={styles.input} />
            ) : <div className={styles.staticField}>{userInfo.email}</div>}
          </div>
        </div>

        <div className={styles.infoColumn}>
          {/* Phone */}
          <div>
            <label className={styles.label}>Số điện thoại</label>
            {isEditing ? (
              <input name="phone" value={userInfo.phone} onChange={handleInputChange} className={styles.input} />
            ) : <div className={styles.staticField}>{userInfo.phone}</div>}
          </div>
          {/* Birth Year */}
          <div>
            <label className={styles.label}>Năm sinh</label>
            {isEditing ? (
              <input name="birthYear" value={userInfo.birthYear} onChange={handleInputChange} className={styles.input} />
            ) : <div className={styles.staticField}>{userInfo.birthYear}</div>}
          </div>
          {/* Address */}
          <div>
            <label className={styles.label}>Địa chỉ</label>
            {isEditing ? (
              <input name="address" value={userInfo.address} onChange={handleInputChange} className={styles.input} />
            ) : (
              <div className={`${styles.staticField} ${styles.addressField}`}>
                <MapPin size={18} className={styles.iconMapPin} />
                {userInfo.address}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
