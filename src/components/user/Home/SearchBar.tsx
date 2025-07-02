"use client";

import styles from "../../../styles/Home/CampaignList.module.css";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="flex justify-center mb-6" data-aos="fade-down">
      <input
        type="text"
        placeholder="🔍 Tìm chiến dịch..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
}
