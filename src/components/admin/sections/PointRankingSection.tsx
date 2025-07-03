import { Section, TextArea, RankInput } from "../dashboard/settings/FormElements";

interface PointSettings {
  pointRule: string;
  bronze: number;
  silver: number;
  gold: number;
  diamond: number;
  vip: number;
}

interface Props {
  pointSettings: PointSettings;
  setPointSettings: React.Dispatch<React.SetStateAction<PointSettings>>;
}

export default function PointRankingSection({
  pointSettings,
  setPointSettings
}: Props) {
  
  const handlePointChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPointSettings((prev) => ({
      ...prev,
      [name]: name === "pointRule" ? value : Number(value)
    }));
  };

  return (
    <Section title="Cài đặt điểm & xếp hạng">

      <TextArea
        label="Quy tắc tính điểm"
        name="pointRule"
        value={pointSettings.pointRule}
        onChange={handlePointChange}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">

        <RankInput 
          level="Đồng" 
          value={pointSettings.bronze} 
          onChange={(value) => setPointSettings({ ...pointSettings, bronze: Number(value) })} 
          color="bg-amber-700"
        />
        <RankInput 
          level="Bạc" 
          value={pointSettings.silver} 
          onChange={(value) => setPointSettings({ ...pointSettings, silver: Number(value) })} 
          color="bg-gray-400"
        />
        <RankInput 
          level="Vàng" 
          value={pointSettings.gold} 
          onChange={(value) => setPointSettings({ ...pointSettings, gold: Number(value) })} 
          color="bg-yellow-500"
        />
        <RankInput 
          level="Kim cương" 
          value={pointSettings.diamond} 
          onChange={(value) => setPointSettings({ ...pointSettings, diamond: Number(value) })} 
          color="bg-blue-300"
        />
        <RankInput 
          level="VIP" 
          value={pointSettings.vip} 
          onChange={(value) => setPointSettings({ ...pointSettings, vip: Number(value) })} 
          color="bg-orange-500"
        />
      </div>
      
    </Section>
  );
}
