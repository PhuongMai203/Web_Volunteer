import React from 'react';
import styles from '@/styles/admin/FormComponents.module.css';

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <div className={styles.sectionContent}>{children}</div>
  </div>
);

export const InputField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange 
}: { 
  label: string; 
  name: string; 
  type?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={styles.input}
    />
  </div>
);

export const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  rows = 4 
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  rows?: number 
}) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={styles.textArea}
    />
  </div>
);

export const FileInput = ({ label, onFileChange }: { label: string; onFileChange: (file: string) => void }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <div className={styles.fileWrapper}>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && onFileChange(URL.createObjectURL(e.target.files[0]))}
        className={styles.hiddenInput}
        id={label.replace(/\s+/g, '-')}
      />
      <label
        htmlFor={label.replace(/\s+/g, '-')}
        className={styles.fileButton}
      >
        Chọn tệp
      </label>
      <span className={styles.fileNote}>.jpg, .png (max 2MB)</span>
    </div>
  </div>
);

export const RankInput = ({ 
  level, 
  value, 
  onChange, 
  color 
}: { 
  level: string; 
  value: number; 
  onChange: (value: number) => void; 
  color: string 
}) => (
  <div className={styles.formGroup}>
    <div className={styles.rankHeader}>
      <div className={`${styles.rankCircle} ${color}`}></div>
      <span className={styles.label}>{level}</span>
    </div>
    <div className={styles.inputWithUnit}>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={styles.input}
      min={0}
    />
    <span className={styles.unit}>điểm</span>
  </div>

  </div>
);

export const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void; 
  min: number; 
  max: number 
}) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <div className={styles.inputWithUnit}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className={styles.input}
        min={min}
        max={max}
      />
      <span className={styles.unit}>mục</span>
    </div>
  </div>
);

export const PolicyTextArea = ({ 
  label, 
  name, 
  value, 
  onChange,
  fullWidth = false
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fullWidth?: boolean;
}) => (
  <div className={`${styles.formGroup} ${fullWidth ? styles.fullWidth : ''}`}>
    <label className={styles.labelBold}>{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={10}
      className={styles.textArea}
    />
    <div className={styles.charCount}>
      {value.length}/5000 ký tự
    </div>
  </div>
);
