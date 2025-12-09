"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

interface User {
  id: string;
  email?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      // 사용자 팀 로드
      const { data: teamMemberships } = await supabase
        .from("team_members")
        .select(
          `
          *,
          team:teams(*)
        `,
        )
        .eq("user_id", currentUser.id);

      const teamsData =
        teamMemberships?.map((m) => ({
          ...m.team,
          user_role: m.role,
        })) || [];

      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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
              <h1 className="text-[32px] font-bold mb-1">대시보드</h1>
              <p className="text-[15px] text-gray-600">
                안녕하세요, {user?.email}님 👋
              </p>
            </div>
            <Link href="/team/create">
              <Button>
                <Icon icon="mdi:plus" className="text-xl" />새 팀 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[32px] font-bold text-[#0056a4] mb-1">
                  {teams.length}
                </div>
                <div className="text-[14px] text-gray-600">참여중인 팀</div>
              </div>
              <Icon
                icon="mdi:account-group"
                className="text-[48px] text-[#0056a4] opacity-20"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[32px] font-bold text-[#748d00] mb-1">
                  {teams.filter((t) => t.user_role === "leader").length}
                </div>
                <div className="text-[14px] text-gray-600">리더 역할</div>
              </div>
              <Icon
                icon="mdi:crown"
                className="text-[48px] text-[#748d00] opacity-20"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[32px] font-bold text-[#0056a4] mb-1">
                  100%
                </div>
                <div className="text-[14px] text-gray-600">설문 완료율</div>
              </div>
              <Icon
                icon="mdi:check-circle"
                className="text-[48px] text-[#0056a4] opacity-20"
              />
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-[24px] font-bold mb-4">내 팀</h2>
        </div>

        {teams.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon
              icon="mdi:account-group-outline"
              className="text-[64px] text-gray-400 mx-auto mb-4"
            />
            <h3 className="text-[20px] font-bold mb-2">아직 팀이 없습니다</h3>
            <p className="text-[15px] text-gray-600 mb-6">
              새로운 팀을 만들거나 초대를 받아보세요
            </p>
            <Link href="/team/create">
              <Button>
                <Icon icon="mdi:plus" className="text-xl" />첫 팀 만들기
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {teams.map((team) => (
              <Link key={team.id} href={`/team/${team.id}`}>
                <Card className="p-6 hover:border-[#0056a4] transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[20px] font-bold mb-2">
                        {team.name}
                      </h3>
                      <p className="text-[14px] text-gray-600 line-clamp-2">
                        {team.description || "팀 설명이 없습니다"}
                      </p>
                    </div>
                    {team.user_role === "leader" && (
                      <span className="px-3 py-1 bg-[#748d00] text-white text-[12px] font-medium rounded-full flex-shrink-0">
                        리더
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                      <Icon
                        icon="mdi:account-multiple"
                        className="text-[18px]"
                      />
                      <span>팀원</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-600">
                      <Icon icon="mdi:calendar" className="text-[18px]" />
                      <span>
                        {new Date(team.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-[24px] font-bold mb-4">빠른 시작</h2>
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6 hover:border-[#0056a4] transition-colors cursor-pointer">
              <Icon
                icon="mdi:file-document"
                className="text-[40px] text-[#0056a4] mb-3"
              />
              <h3 className="text-[18px] font-bold mb-2">가이드 보기</h3>
              <p className="text-[14px] text-gray-600">
                Teamello 사용법과 팁을 확인하세요
              </p>
            </Card>

            <Card className="p-6 hover:border-[#748d00] transition-colors cursor-pointer">
              <Icon
                icon="mdi:chat-question"
                className="text-[40px] text-[#748d00] mb-3"
              />
              <h3 className="text-[18px] font-bold mb-2">FAQ</h3>
              <p className="text-[14px] text-gray-600">
                자주 묻는 질문들을 확인하세요
              </p>
            </Card>

            <Card className="p-6 hover:border-[#0056a4] transition-colors cursor-pointer">
              <Icon
                icon="mdi:email"
                className="text-[40px] text-[#0056a4] mb-3"
              />
              <h3 className="text-[18px] font-bold mb-2">문의하기</h3>
              <p className="text-[14px] text-gray-600">
                도움이 필요하신가요? 언제든 연락주세요
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
