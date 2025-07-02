export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  maxVolunteerCount: number;
  title: string;
  imageUrl?: string;
  status: "active" | "upcoming" | "completed";
  progress: number;
}
