"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import styles from "../../styles/organization/Dashboard.module.css";
import CampaignList from "./CampaignList";
import CampaignDetail from "./CampaignDetail";

export default function OrganizationDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [preSelectedUserId, setPreSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else router.push("/signin");
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <main className={styles.mainContent}>
        {activeTab === "campaigns" && (
          selectedCampaign ? (
            <CampaignDetail
              campaign={selectedCampaign}
              onBack={() => setSelectedCampaign(null)}
              onMessage={(userId: string) => {
                setPreSelectedUserId(userId);
                setActiveTab("contact");
              }}
            />

          ) : (
            <CampaignList userId={userId} onSelectCampaign={(c) => setSelectedCampaign(c)} />
          )
        )}
      </main>
    </div>
  );
}
