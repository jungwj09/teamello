"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        alert("로그인이 필요합니다");
        return;
      }

      // 팀 만들기
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            creator_id: user.id,
          },
        ])
        .select()
        .single();

      if (teamError) throw teamError;

      // 팀원 추가
      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: team.id,
            user_id: user.id,
            role: "leader",
          },
        ]);

      if (memberError) throw memberError;

      router.push(`/team/${team.id}`);
    } catch (error) {
      console.error("Error creating team:", error);
      alert("팀 생성 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-2xl mx-auto px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Icon icon="weui:back-filled" width={26} height={26} />
          <span className="text-[15px] font-medium">뒤로</span>
        </button>
        <div className="mb-8">
          <h1 className="text-[40px] font-bold mb-3">새 팀 만들기</h1>
          <p className="text-[16px] text-gray-600">
            팀 프로젝트를 시작하고 팀원들을 초대하세요
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[15px] font-medium text-gray-900 mb-2">
                팀 이름 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px]"
                placeholder="예: 소프트웨어공학 팀 프로젝트"
              />
            </div>

            <div>
              <label className="block text-[15px] font-medium text-gray-900 mb-2">
                팀 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px] min-h-[120px]"
                placeholder="팀 프로젝트에 대해 간단히 설명해주세요"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "생성 중..." : "팀 생성하기"}
                <Icon icon="mdi:arrow-right" className="text-xl" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <div className="flex gap-3">
            <Icon
              icon="mdi:information"
              className="text-[#0056a4] text-xl flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                다음 단계
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                팀 생성 후 팀원들을 초대하고, 각자 협업 성향 설문을 완료하면
                AI가 자동으로 팀 분석 리포트를 생성합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
