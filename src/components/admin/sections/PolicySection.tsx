import { Section, PolicyTextArea } from "../dashboard/settings/FormElements";

interface PolicySectionProps {
  policySettings: {
    termsOfUse: string;
    privacyPolicy: string;
    volunteerPolicy: string;
  };
  setPolicySettings: React.Dispatch<React.SetStateAction<{
    termsOfUse: string;
    privacyPolicy: string;
    volunteerPolicy: string;
  }>>;
}

export default function PolicySection({
  policySettings,
  setPolicySettings,
}: PolicySectionProps) {
  const handlePolicyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPolicySettings((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Section title="Quản lý điều khoản & chính sách">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PolicyTextArea
          label="Điều khoản sử dụng"
          name="termsOfUse"
          value={policySettings.termsOfUse}
          onChange={handlePolicyChange}
        />
        <PolicyTextArea
          label="Chính sách bảo mật"
          name="privacyPolicy"
          value={policySettings.privacyPolicy}
          onChange={handlePolicyChange}
        />
      </div>
      <div className="mt-6">
        <PolicyTextArea
          label="Chính sách hoạt động tình nguyện"
          name="volunteerPolicy"
          value={policySettings.volunteerPolicy}
          onChange={handlePolicyChange}
          fullWidth
        />
      </div>
    </Section>
  );
}
