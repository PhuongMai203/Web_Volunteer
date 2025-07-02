"use client";

import { useState, useEffect } from "react";
import GeneralInfoSection from "@/components/admin/sections/GeneralInfoSection";
import PointRankingSection from "@/components/admin/sections/PointRankingSection";
import ActivityCategorySection from "@/components/admin/sections/ActivityCategorySection";
import PolicySection from "@/components/admin/sections/PolicySection";
import { getSystemSettings, saveSystemSettings } from "@/lib/firebase/systemSettingsService";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "react-toastify";



export default function AdminSettingPage() {
  const [generalInfo, setGeneralInfo] = useState({
    websiteName: "",
    slogan: "",
    email: "",
    hotline: ""
  });

  const [pointSettings, setPointSettings] = useState({
    pointRule: "",
    bronze: 0,
    silver: 0,
    gold: 0,
    diamond: 0,
    vip: 0
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const [policySettings, setPolicySettings] = useState({
    termsOfUse: "",
    privacyPolicy: "",
    volunteerPolicy: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSystemSettings();
      if (settings) {
        setGeneralInfo(settings.generalInfo || {});
        setPointSettings(settings.pointSettings || {});
        setCategories(settings.categories || []);
        setPolicySettings(settings.policySettings || {});
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

const handleSave = async () => { 
  try {
    await saveSystemSettings({
      generalInfo,
      pointSettings,
      categories,
      policySettings,
      
    });

    await addDoc(collection(db, "activities"), {
      action: "Cập nhật cài đặt bảo mật",
      user: auth.currentUser?.email || "Hệ thống",
      createdAt: serverTimestamp()
    });

    toast.success("Cài đặt đã được lưu thành công!");
  } catch (error) {
    console.error("Lỗi khi lưu cài đặt:", error);
    toast.error("Lưu cài đặt thất bại, vui lòng thử lại.");
  }
};



  if (loading) {
    return <p className="p-6">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="bg-orange-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-orange-700 mb-8">Cài Đặt Hệ Thống</h1>

      <GeneralInfoSection generalInfo={generalInfo} setGeneralInfo={setGeneralInfo} />
      <PointRankingSection pointSettings={pointSettings} setPointSettings={setPointSettings} />
      <ActivityCategorySection categories={categories} setCategories={setCategories} />
      <PolicySection policySettings={policySettings} setPolicySettings={setPolicySettings} />

      <div className="mt-8 text-center">
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          onClick={handleSave}
        >
          Lưu Cài Đặt
        </button>
      </div>
    </div>
  );
}
