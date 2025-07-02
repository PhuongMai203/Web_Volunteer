"use client";

import { ChangeEvent, useState } from "react";
import AccountIdentity from "@/components/user/Account/AccountIdentity";

export default function AccountIdentityPage() {
  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);
  const [portrait, setPortrait] = useState<File | null>(null);

  const handleFileUpload = (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Xác minh danh tính</h1>
      <AccountIdentity
        cccdFront={cccdFront}
        cccdBack={cccdBack}
        portrait={portrait}
        setCccdFront={setCccdFront}
        setCccdBack={setCccdBack}
        setPortrait={setPortrait}
        handleFileUpload={handleFileUpload}
      />
    </div>
  );
}
