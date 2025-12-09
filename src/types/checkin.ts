export interface CheckIn {
  id: string;
  team_id: string;
  user_id: string;
  mood: "great" | "good" | "okay" | "struggling";
  progress: number;
  challenges: string;
  needs_help: boolean;
  created_at: string;
  user?: {
    name: string;
  };
}
