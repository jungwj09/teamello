"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Team, TeamMember } from "@/types/team";

interface User {
  id: string;
  email?: string;
}

interface Survey {
  user_id: string;
  work_style: string;
  communication_preference: string;
  schedule_flexibility: string;
  conflict_style: string;
  strengths: string[];
}

export default function MembersPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      setTeam(teamData);

      const { data: membersData } = await supabase
        .from("team_members")
        .select(`*, user:users(name, email)`)
        .eq("team_id", teamId);
      setMembers(membersData || []);

      const { data: surveysData } = await supabase
        .from("surveys")
        .select("*")
        .eq("team_id", teamId);
      setSurveys(surveysData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);

    try {
      const { data: invitedUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", inviteEmail)
        .single();

      if (!invitedUser) {
        alert("해당 이메일의 사용자를 찾을 수 없습니다");
        return;
      }

      const { error } = await supabase.from("team_members").insert([
        {
          team_id: teamId,
          user_id: invitedUser.id,
          role: inviteRole,
        },
      ]);

      if (error) {
        if (error.message.includes("duplicate")) {
          alert("이미 팀에 참여한 사용자입니다");
        } else {
          throw error;
        }
        return;
      }

      alert("팀원이 추가되었습니다!");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
      loadData();
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("초대 중 오류가 발생했습니다");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("정말로 이 팀원을 제거하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      alert("팀원이 제거되었습니다");
      loadData();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("팀원 제거 중 오류가 발생했습니다");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      alert("역할이 변경되었습니다");
      loadData();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("역할 변경 중 오류가 발생했습니다");
    }
  };

  const getMemberSurvey = (userId: string) => {
    return surveys.find((s) => s.user_id === userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="text-[48px] text-[#0056a4] animate-spin mx-auto mb-4"
          />
          <p className="text-[15px] text-gray-600">로딩 중...</p>
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
              <h1 className="text-[32px] font-bold mb-1">팀원 관리</h1>
              <p className="text-[15px] text-gray-600">{team?.name}</p>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>
              <Icon icon="mdi:account-multiple-plus" className="text-xl" />
              팀원 초대
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 gap-4">
          {members.map((member) => {
            const survey = getMemberSurvey(member.user_id);
            const isCurrentUser = member.user_id === currentUser?.id;

            return (
              <Card key={member.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0056a4] to-[#748d00] rounded-full flex items-center justify-center text-white text-[24px] font-bold flex-shrink-0">
                    {member.user?.name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[20px] font-bold">
                        {member.user?.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-[12px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          나
                        </span>
                      )}
                      <span className="text-[13px] px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-600 mb-4">
                      {member.user?.email}
                    </p>

                    {survey ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">
                            업무 스타일
                          </div>
                          <div className="text-[14px] font-medium">
                            {survey.work_style === "planner" && "계획형"}
                            {survey.work_style === "flexible" && "유연형"}
                            {survey.work_style === "last-minute" && "막판형"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">
                            소통 방식
                          </div>
                          <div className="text-[14px] font-medium">
                            {survey.communication_preference === "frequent" &&
                              "자주 소통"}
                            {survey.communication_preference === "scheduled" &&
                              "정기 미팅"}
                            {survey.communication_preference === "minimal" &&
                              "필요시만"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">
                            강점 영역
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {survey.strengths.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[12px] px-2 py-1 bg-green-50 text-green-700 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[13px] text-gray-500 mb-1">
                            갈등 대응
                          </div>
                          <div className="text-[14px] font-medium">
                            {survey.conflict_style === "direct" && "직접 해결"}
                            {survey.conflict_style === "mediator" &&
                              "중재 선호"}
                            {survey.conflict_style === "avoider" && "회피 경향"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-[13px] text-amber-800">
                          아직 설문을 완료하지 않았습니다
                        </p>
                      </div>
                    )}
                  </div>

                  {!isCurrentUser && (
                    <div className="flex gap-2">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateRole(member.id, e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-[13px]"
                      >
                        <option value="leader">리더</option>
                        <option value="member">멤버</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Icon icon="mdi:delete" className="text-[20px]" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false);
          }}
        >
          <Card className="w-full max-w-md p-8">
            <h2 className="text-[24px] font-bold mb-6">팀원 초대</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
                  placeholder="팀원의 이메일을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  역할
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
                >
                  <option value="member">멤버</option>
                  <option value="leader">리더</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail || inviting}
                  className="flex-1"
                >
                  {inviting ? "초대 중..." : "초대하기"}
                  <Icon icon="mdi:send" className="text-xl" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
