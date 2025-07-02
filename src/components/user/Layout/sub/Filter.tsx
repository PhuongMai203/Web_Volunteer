import { useState } from "react";
import { Filter } from "lucide-react";
import styles from "../../../../styles/Home/Header.module.css";

interface Props {
  onFilterChange: (filterType: "default" | "title" | "endDate") => void;
  children?: React.ReactNode;
}

export default function CampaignFilter({ onFilterChange, children }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={styles.filterWrapper}>
      <button
        title="Lọc chiến dịch"
        className={styles.iconButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Filter size={30} />
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <button onClick={() => { onFilterChange("default"); setShowDropdown(false); }}>Mặc định</button>
          <button onClick={() => { onFilterChange("title"); setShowDropdown(false); }}>Theo tên A-Z</button>
          <button onClick={() => { onFilterChange("endDate"); setShowDropdown(false); }}>Sắp hết hạn</button>
        </div>
      )}

      {children}
    </div>
  );
}
