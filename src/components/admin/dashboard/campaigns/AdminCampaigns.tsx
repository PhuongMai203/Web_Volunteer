"use client";

import { useEffect, useState } from "react";
import { FunnelIcon, Search, PlusIcon } from "lucide-react";
import CampaignStats from "./CampaignStats";
import CampaignTable from "./CampaignTable";
import FilterDropdown from "./FilterDropdown";
import TabButton from "./TabButton";
import CreateCampaignForm from "../../../organization/CreateCampaignForm";
import CampaignDetail from "../../../organization/CampaignDetail";
import styles from "@/styles/admin/AdminCampaigns.module.css";
import { db } from "@/lib/firebase";
import { Activity } from "@/components/types/activity";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

interface FilterOptions {
  status: string;
  date: string;
  volunteers: string;
}

export default function AdminCampaigns() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    date: "all",
    volunteers: "all",
  });
  const [campaigns, setCampaigns] = useState<Activity[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Activity | null>(null);

  const fetchCampaigns = async () => {
    const snapshot = await getDocs(collection(db, "featured_activities"));
    const fetchedData: Activity[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const startDate = typeof data.startDate === "string" ? new Date(data.startDate) : data.startDate.toDate();
      const endDate = typeof data.endDate === "string" ? new Date(data.endDate) : data.endDate.toDate();

      const now = new Date();
      let status: Activity["status"] = "completed";
      if (startDate > now) status = "upcoming";
      else if (startDate <= now && endDate >= now) status = "active";

      return {
        id: doc.id,
        name: data.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        participantCount: data.participantCount || 0,
        maxVolunteerCount: data.maxVolunteerCount || 1,
        title: data.title || "",
        imageUrl: data.imageUrl || "",
        status,
        progress: Math.min(Math.round((data.participantCount || 0) / (data.maxVolunteerCount || 1) * 100), 100),
      };
    });

    setCampaigns(fetchedData);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const handleDeleteCampaign = async (id: string) => {
    await deleteDoc(doc(db, "featured_activities", id));
    setCampaigns(campaigns.filter((c) => c.id !== id));
  };

  const handleEditCampaign = (activity: Activity) => {
    setEditingCampaign(activity);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab !== "all" && campaign.status !== activeTab) return false;
    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.status !== "all" && campaign.status !== filters.status) return false;
    if (filters.date !== "all") {
      const today = new Date();
      const campaignDate = new Date(campaign.startDate);
      if (filters.date === "this-week") {
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        if (campaignDate > nextWeek) return false;
      }
      if (filters.date === "this-month") {
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        if (campaignDate > nextMonth) return false;
      }
    }
    if (filters.volunteers !== "all") {
      if (filters.volunteers === "0-50" && campaign.participantCount > 50) return false;
      if (filters.volunteers === "50-100" && (campaign.participantCount <= 50 || campaign.participantCount > 100)) return false;
      if (filters.volunteers === "100+" && campaign.participantCount <= 100) return false;
    }
    return true;
  });

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.pageTitle}>Quản Lý Chiến Dịch</h1>
          <button onClick={() => setShowCreateForm(true)} className={styles.addButton}>
            <PlusIcon className="h-5 w-5 mr-1" /> Thêm Chiến Dịch
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {showCreateForm ? (
          <CreateCampaignForm
            onSuccess={() => {
              fetchCampaigns();
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : editingCampaign ? (
          <CampaignDetail
            campaign={editingCampaign}
            onBack={() => {
              setEditingCampaign(null);
              fetchCampaigns();
            }}
          />
        ) : (
          <>
            <CampaignStats />
            <div className={styles.filterContainer}>
              <div className={styles.filterHeader}>
                <div className={styles.filterHeaderRow}>
                  <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>Tất Cả</TabButton>
                  <TabButton active={activeTab === "active"} onClick={() => setActiveTab("active")}>Đang Hoạt Động</TabButton>
                  <TabButton active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>Sắp Diễn Ra</TabButton>
                  <TabButton active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Đã Hoàn Thành</TabButton>
                </div>

                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm chiến dịch..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className={styles.searchIcon} />
                </div>
              </div>

              <div className={styles.filterOptions}>
                <FilterDropdown
                  label="Trạng thái"
                  options={[
                    { value: "all", label: "Tất cả trạng thái" },
                    { value: "active", label: "Đang hoạt động" },
                    { value: "upcoming", label: "Sắp diễn ra" },
                    { value: "completed", label: "Đã hoàn thành" },
                  ]}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                />
                <FilterDropdown
                  label="Thời gian"
                  options={[
                    { value: "all", label: "Tất cả thời gian" },
                    { value: "this-week", label: "Tuần này" },
                    { value: "this-month", label: "Tháng này" },
                  ]}
                  value={filters.date}
                  onChange={(value) => handleFilterChange("date", value)}
                />
                <FilterDropdown
                  label="Tình nguyện viên"
                  options={[
                    { value: "all", label: "Tất cả số lượng" },
                    { value: "0-50", label: "0-50 người" },
                    { value: "50-100", label: "50-100 người" },
                    { value: "100+", label: "100+ người" },
                  ]}
                  value={filters.volunteers}
                  onChange={(value) => handleFilterChange("volunteers", value)}
                />
                <button className={styles.clearFilterBtn} onClick={() => setFilters({ status: "all", date: "all", volunteers: "all" })}>
                  <FunnelIcon className="h-5 w-5 mr-1" /> Xóa bộ lọc
                </button>
              </div>
            </div>

            <CampaignTable
              activities={filteredCampaigns}
              onDelete={handleDeleteCampaign}
              onEdit={handleEditCampaign}
            />
          </>
        )}
      </main>
    </div>
  );
}
