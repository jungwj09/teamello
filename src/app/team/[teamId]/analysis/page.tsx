"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import {
  TeamAnalysis,
  RiskFactor,
  Recommendation,
  RoleSuggestion,
} from "@/types/analysis";

interface Team {
  id: string;
  name: string;
}

interface TeamMember {
  user_id: string;
  user?: {
    name: string;
  };
}

export default function AnalysisPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async () => {
    try {
      // 팀 로드
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      setTeam(teamData);

      // 멤버 로드
      const { data: membersData } = await supabase
        .from("team_members")
        .select(`*, user:users(name)`)
        .eq("team_id", teamId);
      setMembers(membersData || []);

      // 가장 최근 분석 로드
      const { data: analysisData } = await supabase
        .from("team_analysis")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setAnalysis(analysisData);
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "mdi:alert-circle";
      case "medium":
        return "mdi:alert";
      case "low":
        return "mdi:information";
      default:
        return "mdi:information";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="text-[48px] text-[#0056a4] animate-spin mx-auto mb-4"
          />
          <p className="text-[15px] text-gray-600">
            분석 결과를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Icon
            icon="mdi:chart-box-outline"
            className="text-[64px] text-gray-400 mx-auto mb-4"
          />
          <h2 className="text-[24px] font-bold mb-3">분석 결과가 없습니다</h2>
          <p className="text-[15px] text-gray-600">
            모든 팀원이 설문을 완료하면 AI 분석이 시작됩니다
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold mb-1">팀 분석 리포트</h1>
              <p className="text-[15px] text-gray-600">{team?.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Icon icon="mdi:download" className="text-xl" />
                PDF 다운로드
              </Button>
              <Button variant="outline">
                <Icon icon="mdi:share-variant" className="text-xl" />
                공유하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <Card className="p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Icon icon="mdi:chart-line" className="text-[#0056a4]" />
              <span className="text-[14px] text-[#0056a4] font-medium">
                종합 위험도
              </span>
            </div>
            <div className="text-[72px] font-bold text-[#0056a4] mb-2">
              {analysis.risk_score}
            </div>
            <p className="text-[16px] text-gray-600 mb-6">
              {analysis.risk_score < 30 && "매우 안정적인 팀입니다"}
              {analysis.risk_score >= 30 &&
                analysis.risk_score < 60 &&
                "일부 주의가 필요합니다"}
              {analysis.risk_score >= 60 && "적극적인 관리가 필요합니다"}
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all"
                  style={{ width: `${analysis.risk_score}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[12px] text-gray-500">
                <span>낮음</span>
                <span>중간</span>
                <span>높음</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-[24px] font-bold mb-6">위험 요소</h2>
              <div className="space-y-4">
                {analysis.risk_factors.map(
                  (factor: RiskFactor, index: number) => (
                    <div
                      key={index}
                      className={`p-5 rounded-lg border-2 ${getSeverityColor(factor.severity)}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Icon
                          icon={
                            factor.severity === "high"
                              ? "mdi:alert-octagon"
                              : "mdi:alert-circle"
                          }
                          className="text-[24px] flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-[17px] font-bold">
                              {factor.category}
                            </h3>
                            <span className="text-[12px] px-2 py-0.5 rounded-full bg-white border">
                              {factor.severity === "high" && "높음"}
                              {factor.severity === "medium" && "중간"}
                              {factor.severity === "low" && "낮음"}
                            </span>
                          </div>
                          <p className="text-[14px] leading-relaxed">
                            {factor.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-[24px] font-bold mb-6">권장 조치사항</h2>
              <div className="space-y-4">
                {analysis.recommendations.map(
                  (rec: Recommendation, index: number) => (
                    <div key={index} className="p-5 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <Icon
                          icon={getPriorityIcon(rec.priority)}
                          className="text-[24px] text-[#0056a4] flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-[17px] font-bold">
                              {rec.title}
                            </h3>
                            <span
                              className={`text-[12px] px-2 py-0.5 rounded-full ${
                                rec.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : rec.priority === "medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {rec.priority === "high" && "중요"}
                              {rec.priority === "medium" && "보통"}
                              {rec.priority === "low" && "참고"}
                            </span>
                          </div>
                          <p className="text-[14px] text-gray-700 mb-3">
                            {rec.description}
                          </p>
                          <div className="space-y-2">
                            {rec.actions.map((action: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Icon
                                  icon="mdi:check-circle"
                                  className="text-[#748d00] text-[18px] flex-shrink-0 mt-0.5"
                                />
                                <span className="text-[13px] text-gray-700">
                                  {action}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-[18px] font-bold mb-4">추천 역할 배치</h3>
              <div className="space-y-4">
                {analysis.role_suggestions.map(
                  (suggestion: RoleSuggestion, index: number) => {
                    const member = members.find(
                      (m) => m.user_id === suggestion.user_id,
                    );
                    return (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#0056a4] to-[#748d00] rounded-full flex items-center justify-center text-white text-[13px] font-bold">
                            {member?.user?.name?.charAt(0)}
                          </div>
                          <div className="font-medium text-[14px]">
                            {member?.user?.name}
                          </div>
                        </div>
                        <div className="text-[15px] font-bold text-[#0056a4] mb-2">
                          {suggestion.suggested_role}
                        </div>
                        <p className="text-[13px] text-gray-600 mb-2">
                          {suggestion.reasoning}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.strengths.map(
                            (strength: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-full"
                              >
                                {strength}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <Icon
                icon="mdi:information"
                className="text-[#0056a4] text-[32px] mb-3"
              />
              <h3 className="text-[15px] font-bold mb-2">분석 정보</h3>
              <p className="text-[13px] text-gray-700 leading-relaxed">
                이 분석은 팀원들의 설문 응답을 기반으로 AI가 자동 생성한
                결과입니다. 주간 체크인을 통해 지속적으로 업데이트됩니다.
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="text-[12px] text-gray-600">
                  생성일:{" "}
                  {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
