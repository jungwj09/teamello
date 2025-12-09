export interface Survey {
  id: string;
  team_id: string;
  user_id: string;
  work_style: "planner" | "flexible" | "last-minute";
  communication_preference: "frequent" | "scheduled" | "minimal";
  schedule_flexibility: "very-flexible" | "somewhat-flexible" | "strict";
  conflict_style: "direct" | "mediator" | "avoider";
  strengths: string[];
  completed_at: string;
}

export interface SurveyFormData {
  work_style: string;
  communication_preference: string;
  schedule_flexibility: string;
  conflict_style: string;
  strengths: string[];
}
