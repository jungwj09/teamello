export interface Team {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    name: string;
    email: string;
  };
}
