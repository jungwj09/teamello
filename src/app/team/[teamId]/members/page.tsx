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
  const [inviteLink, setInviteLink] = useState("");

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

  // 초대 링크 생성
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/team/${teamId}`;
    setInviteLink(link);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);

    try {
      // 1. 해당 이메일의 사용자가 존재하는지 확인
      const { data: invitedUser } = await supabase
        .from("users")
        .select("id, email, name")
        .eq("email", inviteEmail)
        .single();

      if (!invitedUser) {
        alert(
          `${inviteEmail}은 아직 Teamello에 가입하지 않았습니다.\n\n초대 링크를 복사하여 직접 전달해주세요:\n${window.location.origin}/team/${teamId}`,
        );
        generateInviteLink();
        return;
      }

      // 2. 이미 팀에 속해있는지 확인
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", invitedUser.id)
        .single();

      if (existingMember) {
        alert("이미 팀에 참여한 사용자입니다");
        return;
      }

      // 3. 팀원 추가
      const { error } = await supabase.from("team_members").insert([
        {
          team_id: teamId,
          user_id: invitedUser.id,
          role: inviteRole,
        },
      ]);

      if (error) throw error;

      alert(
        `✅ ${invitedUser.name || invitedUser.email}님을 팀에 추가했습니다!\n\n이메일 또는 메신저로 다음 링크를 전달하세요:\n${window.location.origin}/team/${teamId}`,
      );

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

  const copyInviteLink = () => {
    const link = `${window.location.origin}/team/${teamId}`;
    navigator.clipboard.writeText(link);
    alert("✅ 초대 링크가 복사되었습니다!\n팀원에게 전달해주세요.");
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={copyInviteLink}>
                <Icon icon="mdi:link" className="text-xl" />
                초대 링크 복사
              </Button>
              <Button onClick={() => setShowInviteModal(true)}>
                <Icon icon="mdi:account-multiple-plus" className="text-xl" />
                팀원 초대
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* 초대 안내 카드 */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <Icon
              icon="mdi:information"
              className="text-[32px] text-[#0056a4] flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-[16px] font-bold mb-2">팀원 초대 방법</h3>
              <ol className="text-[14px] text-gray-700 space-y-1 ml-4">
                <li>
                  1. &quot;초대 링크 복사&quot; 버튼을 클릭하여 링크를
                  복사합니다
                </li>
                <li>2. 카카오톡, 이메일 등으로 팀원에게 링크를 전달합니다</li>
                <li>
                  3. 팀원이 Teamello에 가입 후 링크를 통해 팀에 참여합니다
                </li>
              </ol>
            </div>
          </div>
        </Card>

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

      {/* 초대 모달 */}
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
              {/* 방법 1: 이메일로 직접 추가 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-[15px] font-bold mb-2">
                  📧 방법 1: 이미 가입한 팀원 추가
                </h3>
                <p className="text-[13px] text-gray-600 mb-3">
                  Teamello에 이미 가입한 팀원의 이메일을 입력하세요
                </p>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px] mb-2"
                  placeholder="예: teamate@example.com"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px] mb-3"
                >
                  <option value="member">멤버</option>
                  <option value="leader">리더</option>
                </select>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail || inviting}
                  className="w-full"
                >
                  {inviting ? "추가 중..." : "팀원 추가"}
                  <Icon icon="mdi:account-plus" className="text-xl" />
                </Button>
              </div>

              {/* 방법 2: 링크로 초대 */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-[15px] font-bold mb-2">
                  🔗 방법 2: 초대 링크 전달
                </h3>
                <p className="text-[13px] text-gray-600 mb-3">
                  링크를 복사하여 카카오톡, 이메일 등으로 전달하세요
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/team/${teamId}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-600"
                  />
                  <Button variant="outline" onClick={copyInviteLink}>
                    <Icon icon="mdi:content-copy" className="text-xl" />
                    복사
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  닫기
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
