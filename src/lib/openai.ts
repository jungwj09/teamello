import OpenAI from "openai";
import { Survey } from "@/types/survey";
import { CheckIn } from "@/types/checkin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeTeamDynamics(surveys: Survey[]) {
  const surveyData = surveys.map((s) => ({
    work_style: s.work_style,
    communication: s.communication_preference,
    schedule: s.schedule_flexibility,
    conflict: s.conflict_style,
    strengths: s.strengths,
  }));

  const prompt = `
당신은 팀 협업 전문가입니다. 다음 팀원들의 설문 결과를 분석하여 갈등 위험을 예측하고 해결책을 제시해주세요.

팀원 설문 데이터:
${JSON.stringify(surveyData, null, 2)}

다음 형식의 JSON으로 응답해주세요:
{
  "risk_score": 1-100 사이의 숫자 (높을수록 위험),
  "risk_factors": [
    {
      "category": "카테고리명 (예: 업무 스타일 차이, 소통 방식 불일치)",
      "severity": "low/medium/high",
      "description": "구체적인 위험 요소 설명",
      "affected_members": ["영향받는 팀원 인덱스"]
    }
  ],
  "recommendations": [
    {
      "title": "권장사항 제목",
      "description": "상세 설명",
      "priority": "high/medium/low",
      "actions": ["구체적인 실행 방안들"]
    }
  ],
  "role_suggestions": [
    {
      "member_index": 0,
      "suggested_role": "추천 역할",
      "reasoning": "추천 이유",
      "strengths": ["활용할 강점들"]
    }
  ]
}

갈등 예방과 팀워크 향상에 초점을 맞춰 분석해주세요.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function detectConflictRisk(checkins: CheckIn[]) {
  const recentCheckins = checkins.slice(-7); // 최근 7일

  const prompt = `
팀원들의 최근 체크인 데이터를 분석하여 갈등 위험 신호를 감지해주세요.

체크인 데이터:
${JSON.stringify(recentCheckins, null, 2)}

다음 형식의 JSON으로 응답해주세요:
{
  "risk_level": "none/low/medium/high",
  "concerns": [
    {
      "type": "우려 유형 (예: 진행 지연, 감정적 스트레스)",
      "description": "상세 설명",
      "affected_members": ["영향받는 팀원들"]
    }
  ],
  "intervention_needed": true/false,
  "suggested_actions": ["즉시 실행할 수 있는 조치들"]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
