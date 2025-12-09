"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { CheckIn } from "@/types/checkin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface Team {
  id: string;
  name: string;
}

const moods = [
  { value: "great", label: "매우 좋음", icon: "😊", color: "text-green-600" },
  { value: "good", label: "좋음", icon: "🙂", color: "text-blue-600" },
  { value: "okay", label: "보통", icon: "😐", color: "text-amber-600" },
  { value: "struggling", label: "힘듦", icon: "😟", color: "text-red-600" },
];

export default function CheckInPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mood: "",
    progress: 50,
    challenges: "",
    needs_help: false,
  });

  const loadData = useCallback(async () => {
    try {
      const { data: teamData } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      setTeam(teamData);

      const { data: checkinsData } = await supabase
        .from("checkins")
        .select(
          `
          *,
          user:users(name)
        `,
        )
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentCheckins(checkinsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [teamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("로그인 필요");

      const { error } = await supabase.from("checkins").insert([
        {
          team_id: teamId,
          user_id: user.id,
          ...formData,
        },
      ]);

      if (error) throw error;

      setShowForm(false);
      setFormData({
        mood: "",
        progress: 50,
        challenges: "",
        needs_help: false,
      });
      loadData();
    } catch (error) {
      console.error("Error submitting check-in:", error);
      alert("체크인 제출 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    return moods.find((m) => m.value === mood)?.icon || "🙂";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <h1 className="text-[32px] font-bold mb-1">주간 체크인</h1>
          <p className="text-[15px] text-gray-600">{team?.name}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {!showForm ? (
              <Card className="p-8 text-center">
                <Icon
                  icon="mdi:clipboard-check"
                  className="text-[64px] text-[#0056a4] mx-auto mb-4"
                />
                <h2 className="text-[24px] font-bold mb-3">
                  이번 주는 어떠셨나요?
                </h2>
                <p className="text-[15px] text-gray-600 mb-6">
                  팀원들에게 당신의 상태를 공유하고 필요한 도움을 요청하세요
                </p>
                <Button onClick={() => setShowForm(true)}>
                  체크인 시작하기
                  <Icon icon="mdi:arrow-right" className="text-xl" />
                </Button>
              </Card>
            ) : (
              <Card className="p-8">
                <h2 className="text-[24px] font-bold mb-6">주간 체크인</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[15px] font-medium text-gray-900 mb-3">
                      현재 기분은 어떤가요?
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {moods.map((mood) => (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, mood: mood.value })
                          }
                          className={`p-4 border-2 rounded-lg transition-all ${
                            formData.mood === mood.value
                              ? "border-[#0056a4] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-[32px] mb-2">{mood.icon}</div>
                          <div className="text-[13px] font-medium">
                            {mood.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="block text-[15px] font-medium text-gray-900 mb-3">
                      프로젝트 진행률: {formData.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          progress: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0056a4]"
                    />
                    <div className="flex justify-between mt-2 text-[12px] text-gray-500">
                      <span>시작</span>
                      <span>진행중</span>
                      <span>완료</span>
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <label className="block text-[15px] font-medium text-gray-900 mb-2">
                      어려움이나 고민거리가 있나요?
                    </label>
                    <textarea
                      value={formData.challenges}
                      onChange={(e) =>
                        setFormData({ ...formData, challenges: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056a4] text-[15px] min-h-[120px]"
                      placeholder="팀원들과 공유하고 싶은 내용을 자유롭게 작성하세요"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="needs_help"
                      checked={formData.needs_help}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          needs_help: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 accent-[#0056a4]"
                    />
                    <label
                      htmlFor="needs_help"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="text-[15px] font-medium text-gray-900 mb-1">
                        도움이 필요합니다
                      </div>
                      <div className="text-[13px] text-gray-600">
                        체크 시 팀 리더에게 알림이 전송됩니다
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={!formData.mood || loading}
                      className="flex-1"
                    >
                      {loading ? "제출 중..." : "체크인 완료"}
                      <Icon icon="mdi:check" className="text-xl" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {recentCheckins.length > 0 && (
              <Card className="p-6">
                <h3 className="text-[20px] font-bold mb-4">최근 체크인</h3>
                <div className="space-y-4">
                  {recentCheckins.map((checkin) => (
                    <div key={checkin.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-[32px]">
                          {getMoodEmoji(checkin.mood)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[15px]">
                              {checkin.user?.name}
                            </span>
                            <span className="text-[13px] text-gray-500">
                              {new Date(checkin.created_at).toLocaleDateString(
                                "ko-KR",
                              )}
                            </span>
                            {checkin.needs_help && (
                              <span className="text-[12px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                도움 필요
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-gray-600 mb-2">
                            진행률: {checkin.progress}%
                          </div>
                          {checkin.challenges && (
                            <p className="text-[14px] text-gray-700 leading-relaxed">
                              {checkin.challenges}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <Icon
                icon="mdi:lightbulb"
                className="text-[#0056a4] text-[32px] mb-3"
              />
              <h3 className="text-[15px] font-bold mb-2">체크인 팁</h3>
              <ul className="space-y-2 text-[13px] text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>정직하게 상태를 공유하세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>어려움은 숨기지 말고 표현하세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>팀원들의 상황도 확인해보세요</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>주 1회 체크인을 권장합니다</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-[15px] font-bold mb-3">AI 모니터링</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                체크인 데이터를 분석하여 갈등 위험 신호를 자동으로 감지합니다.
              </p>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:shield-check"
                    className="text-green-600 text-[20px]"
                  />
                  <span className="text-[13px] text-green-700 font-medium">
                    현재 팀 상태 양호
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
