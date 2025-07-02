"use client";

import { useState, useEffect } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "../../styles/organization/CreateCampaignForm.module.css";
import { getSystemSettings } from "@/lib/firebase/systemSettingsService";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateCampaignForm({ onSuccess, onCancel }: Props) {
  const user = auth.currentUser;

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    phoneNumber: "",
    category: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    supportType: "",
    urgency: "thấp",
    receivingMethod: "",
    bankName: "",
    bankAccount: "",
    maxVolunteerCount: "",
  });

  const [confirm, setConfirm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const supportTypes = [
    "Thực phẩm", "Tiền mặt", "Y tế", "Vật dụng", "Nhà ở", "Quần áo", "Tại chỗ", "Khác"
  ];

  const banks = [
    "Vietcombank", "Techcombank", "BIDV", "VietinBank", "Agribank", "MB Bank", "Sacombank",
    "ACB", "VPBank", "HDBank", "SHB", "TPBank", "Eximbank", "LienVietPostBank", "OCB", "SCB",
    "SeABank", "Bac A Bank", "DongA Bank", "Nam A Bank", "ABBANK", "PVcomBank", "VIB", "Viet Capital Bank",
    "SaigonBank", "CBBank", "GPBank", "VietBank", "OceanBank", "BaoViet Bank", "KienlongBank", "NCB",
    "PG Bank", "VRB", "HSBC", "Standard Chartered", "Shinhan Bank", "CitiBank", "ANZ", "UOB", "Woori Bank",
    "Public Bank", "Hong Leong Bank", "DBS Bank", "BNP Paribas", "Deutsche Bank", "Bank of China"
  ];

  const urgencyLevels = ["thấp", "trung bình", "cao"];

  useEffect(() => {
    const fetchCategories = async () => {
      const settings = await getSystemSettings();
      if (settings?.categories) {
        setCategories(settings.categories);
      }
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUrgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, urgency: urgencyLevels[Number(e.target.value)] });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setForm((prevForm) => ({
        ...prevForm,
        imageUrl: URL.createObjectURL(file),
      }));
    } else {
      setImageFile(null);
      setForm((prevForm) => ({
        ...prevForm,
        imageUrl: "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để tạo chiến dịch.");
      return;
    }

    if (!form.title || !form.description || !form.category || !form.address || !form.phoneNumber ||
      !form.supportType || !form.startDate || !form.endDate || !form.receivingMethod) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (!/^0\d{9}$/.test(form.phoneNumber)) {
      alert("Số điện thoại phải bắt đầu bằng 0 và có 10 số.");
      return;
    }

    if (form.receivingMethod === "Tài khoản ngân hàng" && (!form.bankName || !form.bankAccount)) {
      alert("Vui lòng nhập đầy đủ thông tin ngân hàng.");
      return;
    }

    if (!confirm) {
      alert("Vui lòng xác nhận thông tin chính xác.");
      return;
    }

    let uploadedImageUrl = form.imageUrl;

    if (imageFile) {
      try {
        const imageRef = ref(storage, `featured_activities/${imageFile.name}_${Date.now()}`);
        await uploadBytes(imageRef, imageFile);
        uploadedImageUrl = await getDownloadURL(imageRef);
        console.log("Ảnh đã được tải lên:", uploadedImageUrl);
      } catch (error) {
        console.error("Lỗi khi tải ảnh lên:", error);
        alert("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
        return;
      }
    }

    try {
      await addDoc(collection(db, "featured_activities"), {
        title: form.title,
        description: form.description,
        address: form.address,
        phoneNumber: form.phoneNumber,
        category: form.category,
        imageUrl: uploadedImageUrl,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        supportType: form.supportType,
        urgency: form.urgency,
        receivingMethod: form.receivingMethod,
        bankName: form.bankName || "",
        bankAccount: form.bankAccount || "",
        maxVolunteerCount: Number(form.maxVolunteerCount) || 0,
        participantCount: 0,
        totalDonationAmount: 0,
        creatorEmail: user.email,
        email: user.email,
        fullName: user.displayName || "Người dùng",
        userId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      alert("Tạo chiến dịch thành công!");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi tạo chiến dịch.");
    }
  };

  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Tạo chiến dịch mới</h2>

        <label className={styles.label}>Tiêu đề*</label>
        <input className={styles.input} type="text" name="title" value={form.title} onChange={handleChange} />

        <label className={styles.label}>Mô tả*</label>
        <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} />

        <div className={styles.formRow}>
          <label className={styles.label}>Địa chỉ liên hệ*</label>
          <input className={styles.input} type="text" name="address" value={form.address} onChange={handleChange} />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Số điện thoại*</label>
          <input className={styles.input} type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Bắt đầu bằng 0, đủ 10 số" />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Danh mục*</label>
          <select className={styles.select} name="category" value={form.category} onChange={handleChange}>
            <option value="">-- Chọn danh mục --</option>
            {loadingCategories ? (
              <option disabled>Đang tải...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))
            )}
          </select>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Hình đại diện*</label>
          <input className={styles.input} type="file" name="imageFile" accept="image/*" onChange={handleImageChange} />
        </div>

        {form.imageUrl && (
          <div className={styles.imagePreviewContainer}>
            <img src={form.imageUrl} alt="Xem trước hình đại diện" className={styles.thumbnailPreview} />
          </div>
        )}

        <label className={styles.label}>Thời gian thực hiện*</label>
        <div className={styles.dateRow}>
          <input className={styles.input} type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          <span> - </span>
          <input className={styles.input} type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </div>

        <label className={styles.label}>Loại hỗ trợ cần thiết*</label>
        <select className={styles.select} name="supportType" value={form.supportType} onChange={handleChange}>
          <option value="">-- Chọn loại hỗ trợ --</option>
          {supportTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <div className={styles.formRow}>
          <label className={styles.label}>Mức độ khẩn cấp</label>
          <div className={styles.urgencyControl}>
            <input type="range" className={styles.rangeInput} name="urgency" min="0" max="2" value={urgencyLevels.indexOf(form.urgency)} onChange={handleUrgencyChange} />
            <div className={styles.urgencyLevels}>
              <span>Thấp</span>
              <span>Trung bình</span>
              <span>Cao</span>
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Phương thức nhận hỗ trợ*</label>
          <select className={styles.select} name="receivingMethod" value={form.receivingMethod} onChange={handleChange}>
            <option value="">-- Chọn phương thức --</option>
            <option value="Trực tiếp">Tham gia tình nguyện trực tiếp</option>
            <option value="Tài khoản ngân hàng">Chuyển khoản ngân hàng</option>
            <option value="Ví điện tử">Ví điện tử</option>
          </select>
        </div>

        {form.receivingMethod === "Tài khoản ngân hàng" && (
          <div className={styles.bankInfo}>
            <div className={styles.formRow}>
              <label className={styles.label}>Ngân hàng*</label>
              <select className={styles.select} name="bankName" value={form.bankName} onChange={handleChange}>
                <option value="">-- Chọn ngân hàng --</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>Số tài khoản*</label>
              <input className={styles.input} type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className={styles.formRow}>
          <label className={styles.label}>Số lượng tình nguyện viên tối đa*</label>
          <input className={styles.input} type="number" name="maxVolunteerCount" value={form.maxVolunteerCount} onChange={handleChange} />
        </div>

        <div className={styles.confirmRow}>
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
          <span className={styles.confirmText}>Tôi xác nhận thông tin là chính xác*</span>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.submitButton} onClick={handleSubmit}>Tạo chiến dịch</button>
          <button className={styles.cancelButton} onClick={onCancel}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
