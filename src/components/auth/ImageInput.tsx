"use client";

import { useState, useRef } from "react";
import styles from "../../styles/auth/BusinessSignup.module.css";
import { FiCamera, FiLink, FiX, FiCheck } from "react-icons/fi";
import Image from "next/image";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  captureType?: "environment" | "user";
};

const ImageField = ({ label, value, onChange, captureType = "environment" }: ImageFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [tempUrl, setTempUrl] = useState("");

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (tempUrl.trim()) {
      onChange(tempUrl);
      setTempUrl("");
      setShowOptions(false);
    }
  };

  return (
    <div className={styles.imageField}>
      <label className={styles.formLabel}>{label}</label>

      {value ? (
        <div className={styles.imagePreviewContainer}>
          <Image
            src={value}
            alt={label}
            width={200}
            height={120}
            className={styles.imagePreview}
          />
          <button
            type="button"
            className={styles.removeImageButton}
            onClick={() => onChange("")}
          >
            <FiX />
          </button>
        </div>
      ) : (
        <div className={styles.urlInputContainer}>
          {showOptions ? (
            <div className={styles.urlInputGroup}>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="Dán URL hình ảnh"
                className={styles.urlInput}
              />
              <div className={styles.urlActions}>
                <button
                  type="button"
                  className={styles.urlSubmitButton}
                  onClick={handleUrlSubmit}
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  className={styles.urlCancelButton}
                  onClick={() => setShowOptions(false)}
                >
                  <FiX />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.inputOptions}>
              <button
                type="button"
                className={styles.optionButton}
                onClick={() => setShowOptions(true)}
              >
                <FiLink className={styles.optionIcon} />
                Nhập URL
              </button>
              <button
                type="button"
                className={styles.optionButton}
                onClick={handleCameraClick}
              >
                <FiCamera className={styles.optionIcon} />
                Chụp ảnh
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={captureType}
            onChange={handleFileChange}
            className={styles.hiddenFileInput}
          />
        </div>
      )}
    </div>
  );
};

export default ImageField;
