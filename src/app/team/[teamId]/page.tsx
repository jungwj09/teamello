"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Team, TeamMember } from "@/types/team";
import { Survey } from "@/types/survey";
import { TeamAnalysis } from "@/types/analysis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface User {
  id: string;
  email?: string;
}

export default function TeamDashboard() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const triggerAIAnalysis = async (teamId: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        throw new Error("AI 분석 실패");
      }

      const result = await response.json();
      console.log("AI 분석 완료:", result);

      // 분석 결과를 state에 업데이트
      setAnalysis(result.analysis);

      // 성공 알림
      alert("🎉 AI 팀 분석이 완료되었습니다! 분석 리포트를 확인해보세요.");
    } catch (error) {
      console.error("Error triggering AI analysis:", error);
      alert("AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadTeamData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

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
        .select(
          `
          *,
          user:users(name, email)
        `,
        )
        .eq("team_id", teamId);
      setMembers(membersData || []);

      // 설문조사 로드
      const { data: surveysData } = await supabase
        .from("surveys")
        .select("*")
        .eq("team_id", teamId);
      setSurveys(surveysData || []);

      // 분석 로드
      const { data: analysisData } = await supabase
        .from("team_analysis")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setAnalysis(analysisData);

      // 자동 AI 분석 트리거 -> 모든 팀원이 설문을 완료했고, 아직 분석이 없으면 자동으로 분석 실행
      if (
        membersData &&
        surveysData &&
        membersData.length > 0 &&
        surveysData.length === membersData.length &&
        !analysisData
      ) {
        console.log(
          "✨ 모든 팀원이 설문을 완료했습니다. AI 분석을 시작합니다...",
        );
        await triggerAIAnalysis(teamId);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const userHasSurvey = surveys.some((s) => s.user_id === currentUser?.id);
  const allMembersCompleted =
    members.length > 0 && surveys.length === members.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="text-[48px] text-[#0056a4] animate-spin mx-auto mb-4"
          />
          <p className="text-[15px] text-gray-600">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold mb-1">{team?.name}</h1>
              <p className="text-[15px] text-gray-600">{team?.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Icon icon="mdi:account-multiple-plus" className="text-xl" />
                팀원 초대
              </Button>
              <Button variant="outline">
                <Icon icon="mdi:cog" className="text-xl" />
                설정
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {!userHasSurvey && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0056a4] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="mdi:clipboard-text"
                      className="text-white text-[24px]"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-bold mb-2">
                      협업 성향 설문이 필요합니다
                    </h3>
                    <p className="text-[14px] text-gray-700 mb-4">
                      AI 기반 팀 분석을 위해 간단한 설문을 완료해주세요. 약
                      3분이 소요됩니다.
                    </p>
                    <Link href={`/survey?teamId=${teamId}`}>
                      <Button>
                        설문 시작하기
                        <Icon icon="mdi:arrow-right" className="text-xl" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* AI 분석 진행 */}
            {analyzing && (
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-start gap-4">
                  <Icon
                    icon="mdi:loading"
                    className="text-[48px] text-purple-600 animate-spin flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-[18px] font-bold mb-2">
                      AI가 팀을 분석하고 있습니다...
                    </h3>
                    <p className="text-[14px] text-gray-700">
                      팀원들의 설문 결과를 바탕으로 협업 리스크를 분석하고
                      있습니다. 잠시만 기다려주세요.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* 분석 결과 */}
            {analysis && !analyzing && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[20px] font-bold mb-1">
                      팀 분석 리포트
                    </h3>
                    <p className="text-[14px] text-gray-600">
                      AI가 분석한 팀의 협업 리스크와 권장사항
                    </p>
                  </div>
                  <Link href={`/team/${teamId}/analysis`}>
                    <Button variant="outline">
                      전체 보기
                      <Icon icon="mdi:arrow-right" className="text-xl" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-[32px] font-bold text-[#0056a4] mb-1">
                      {analysis.risk_score}
                    </div>
                    <div className="text-[13px] text-gray-600">위험도 점수</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-[32px] font-bold text-[#748d00] mb-1">
                      {analysis.risk_factors.length}
                    </div>
                    <div className="text-[13px] text-gray-600">위험 요소</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-[32px] font-bold text-[#0056a4] mb-1">
                      {analysis.recommendations.length}
                    </div>
                    <div className="text-[13px] text-gray-600">권장사항</div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link href={`/team/${teamId}/checkin`}>
                <Card className="p-6 hover:border-[#0056a4] transition-colors cursor-pointer h-full">
                  <Icon
                    icon="mdi:clipboard-check"
                    className="text-[32px] text-[#0056a4] mb-3"
                  />
                  <h3 className="text-[18px] font-bold mb-2">주간 체크인</h3>
                  <p className="text-[14px] text-gray-600">
                    진행 상황과 기분을 공유하세요
                  </p>
                </Card>
              </Link>

              <Link href={`/team/${teamId}/members`}>
                <Card className="p-6 hover:border-[#748d00] transition-colors cursor-pointer h-full">
                  <Icon
                    icon="mdi:account-group"
                    className="text-[32px] text-[#748d00] mb-3"
                  />
                  <h3 className="text-[18px] font-bold mb-2">팀원 관리</h3>
                  <p className="text-[14px] text-gray-600">
                    역할 배정과 기여도 확인
                  </p>
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-[18px] font-bold mb-4">설문 진행 상황</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-gray-600">
                    {surveys.length} / {members.length} 완료
                  </span>
                  <span className="text-[14px] font-medium text-[#0056a4]">
                    {members.length > 0
                      ? Math.round((surveys.length / members.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0056a4] to-[#748d00] transition-all"
                    style={{
                      width: `${members.length > 0 ? (surveys.length / members.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {!allMembersCompleted && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-[13px] text-amber-800">
                    모든 팀원이 설문을 완료하면 AI 분석이 자동으로 시작됩니다
                  </p>
                </div>
              )}

              {allMembersCompleted && !analysis && !analyzing && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-[13px] text-green-800 mb-2">
                    ✅ 모든 팀원이 설문을 완료했습니다!
                  </p>
                  <Button
                    onClick={() => triggerAIAnalysis(teamId)}
                    className="w-full text-[13px] py-2"
                  >
                    <Icon icon="mdi:robot" className="text-lg" />
                    AI 분석 시작하기
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-[18px] font-bold mb-4">
                팀원 ({members.length})
              </h3>
              <div className="space-y-3">
                {members.map((member) => {
                  const hasSurvey = surveys.some(
                    (s) => s.user_id === member.user_id,
                  );
                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0056a4] to-[#748d00] rounded-full flex items-center justify-center text-white font-bold">
                        {member.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-medium">
                          {member.user?.name}
                        </div>
                        <div className="text-[12px] text-gray-500">
                          {member.role}
                        </div>
                      </div>
                      {hasSurvey && (
                        <Icon
                          icon="mdi:check-circle"
                          className="text-[#748d00] text-xl"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
      <Footer />
    </div>
  );
}
