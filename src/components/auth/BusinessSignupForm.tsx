"use client";

import React, { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "@/styles/auth/BusinessSignup.module.css";
import { useRouter } from "next/navigation";

import Step1Account from "./business-signup/Step1Account";
import Step2Company from "./business-signup/Step2Company";
import Step3Completion from "./business-signup/Step3Completion";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [license, setLicense] = useState("");
  const [address, setAddress] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [position, setPosition] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [portrait, setPortrait] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [stamp, setStamp] = useState<File | null>(null);
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const router = useRouter();

  const uploadFile = async (file: File, folder: string, uid: string): Promise<string> => {
    const filename = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `${folder}/${uid}/${filename}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleAccountRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        role: "organization",
        isDisabled: true,
      });
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đăng ký tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompanyInfo = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Không tìm thấy thông tin người dùng.");
        return;
      }

      const uid = user.uid;
      const folder = "verifications";

      const idCardFrontUrl = idCardFront ? await uploadFile(idCardFront, folder, uid) : "";
      const idCardBackUrl = idCardBack ? await uploadFile(idCardBack, folder, uid) : "";
      const portraitUrl = portrait ? await uploadFile(portrait, folder, uid) : "";
      const logoUrl = logo ? await uploadFile(logo, folder, uid) : "";
      const stampUrl = stamp ? await uploadFile(stamp, folder, uid) : "";

      await setDoc(doc(db, "businessVerifications", uid), {
        userId: uid,
        userEmail: user.email,
        companyName,
        taxCode,
        license,
        address,
        representativeName,
        position,
        idNumber,
        idCardFrontUrl,
        idCardBackUrl,
        portraitUrl,
        logoUrl,
        stampUrl,
        bankName,
        branch,
        accountNumber,
        accountHolder,
        status: "pending",
        submittedAt: new Date(),
        email: user.email,
      });

      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gửi thông tin xác minh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepTitle}>Tài khoản</div>
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepTitle}>Thông tin</div>
        </div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepTitle}>Hoàn tất</div>
        </div>
      </div>

      {step === 1 && (
        <Step1Account
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          loading={loading}
          error={error}
          onNext={handleAccountRegister}
        />
      )}

      {step === 2 && (
        <Step2Company
          companyName={companyName}
          setCompanyName={setCompanyName}
          taxCode={taxCode}
          setTaxCode={setTaxCode}
          license={license}
          setLicense={setLicense}
          address={address}
          setAddress={setAddress}
          representativeName={representativeName}
          setRepresentativeName={setRepresentativeName}
          position={position}
          setPosition={setPosition}
          idNumber={idNumber}
          setIdNumber={setIdNumber}
          idCardFront={idCardFront}
          setIdCardFront={setIdCardFront}
          idCardBack={idCardBack}
          setIdCardBack={setIdCardBack}
          portrait={portrait}
          setPortrait={setPortrait}
          logo={logo}
          setLogo={setLogo}
          stamp={stamp}
          setStamp={setStamp}
          bankName={bankName}
          setBankName={setBankName}
          branch={branch}
          setBranch={setBranch}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          accountHolder={accountHolder}
          setAccountHolder={setAccountHolder}
          loading={loading}
          error={error}
          onBack={() => setStep(1)}
          onSubmit={handleSubmitCompanyInfo}
        />
      )}

      {step === 3 && (
        <Step3Completion router={router} />
      )}
    </div>
  );
}
