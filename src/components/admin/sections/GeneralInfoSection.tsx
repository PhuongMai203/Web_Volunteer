import { Section, InputField, FileInput } from "../dashboard/settings/FormElements";

export default function GeneralInfoSection({ 
  generalInfo, 
  setGeneralInfo 
}: { 
  generalInfo: any; 
  setGeneralInfo: React.Dispatch<React.SetStateAction<any>>;
}) {
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralInfo((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Section title="Thông tin chung của hệ thống">
      <InputField
        label="Tên website"
        name="websiteName"
        value={generalInfo.websiteName}
        onChange={handleGeneralChange}
      />
      <InputField
        label="Slogan"
        name="slogan"
        value={generalInfo.slogan}
        onChange={handleGeneralChange}
      />
    
      <InputField
        label="Email liên hệ"
        name="email"
        type="email"
        value={generalInfo.email}
        onChange={handleGeneralChange}
      />
      <InputField
        label="Hotline hỗ trợ"
        name="hotline"
        value={generalInfo.hotline}
        onChange={handleGeneralChange}
      />
    </Section>
  );
}