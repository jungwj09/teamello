export interface TeamAnalysis {
  id: string;
  team_id: string;
  risk_score: number;
  risk_factors: RiskFactor[];
  recommendations: Recommendation[];
  role_suggestions: RoleSuggestion[];
  created_at: string;
}

export interface RiskFactor {
  category: string;
  severity: "low" | "medium" | "high";
  description: string;
  affected_members: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actions: string[];
}

export interface RoleSuggestion {
  user_id: string;
  suggested_role: string;
  reasoning: string;
  strengths: string[];
}
