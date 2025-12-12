"use client";
export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, getCurrentUser } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const questions = [
  {
    id: "work_style" as const,
    title: "업무 스타일",
    question: "프로젝트를 진행할 때 선호하는 방식은?",
    options: [
      {
        value: "planner",
        label: "📋 계획형",
        desc: "사전에 상세히 계획하고 체계적으로 진행",
      },
      {
        value: "flexible",
        label: "🔄 유연형",
        desc: "상황에 따라 유연하게 대응",
      },
      {
        value: "last-minute",
        label: "⚡ 막판형",
        desc: "마감 직전 집중력 발휘",
      },
    ],
  },
  {
    id: "communication_preference" as const,
    title: "소통 방식",
    question: "팀원들과 어떻게 소통하는 것을 선호하나요?",
    options: [
      {
        value: "frequent",
        label: "💬 자주 소통",
        desc: "수시로 의견 공유하고 피드백",
      },
      {
        value: "scheduled",
        label: "📅 정기 미팅",
        desc: "정해진 시간에 집중적으로 소통",
      },
      {
        value: "minimal",
        label: "📝 필요시만",
        desc: "꼭 필요할 때만 간결하게",
      },
    ],
  },
  {
    id: "schedule_flexibility" as const,
    title: "일정 유연성",
    question: "일정 변경에 대한 당신의 태도는?",
    options: [
      {
        value: "very-flexible",
        label: "😊 매우 유연",
        desc: "언제든 조정 가능",
      },
      {
        value: "somewhat-flexible",
        label: "🤔 어느 정도",
        desc: "합리적 이유가 있다면 OK",
      },
      { value: "strict", label: "⏰ 엄격", desc: "정해진 일정 준수 중요" },
    ],
  },
  {
    id: "conflict_style" as const,
    title: "갈등 대응",
    question: "팀 내 갈등이 생기면 어떻게 대응하나요?",
    options: [
      { value: "direct", label: "💪 직접 해결", desc: "즉시 대화로 해결 시도" },
      {
        value: "mediator",
        label: "🤝 중재 선호",
        desc: "제3자 도움 받아 해결",
      },
      {
        value: "avoider",
        label: "🙈 회피 경향",
        desc: "시간이 해결해주길 기다림",
      },
    ],
  },
];

const strengthOptions = [
  "기획/아이디어",
  "디자인",
  "개발/코딩",
  "자료조사",
  "문서작성",
  "발표",
  "일정관리",
  "팀 조율",
];

type QuestionId = (typeof questions)[number]["id"];

interface SurveyAnswers {
  work_style?: string;
  communication_preference?: string;
  schedule_flexibility?: string;
  conflict_style?: string;
  strengths: string[];
}

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    strengths: [],
  });
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length;

  const handleAnswer = (value: string) => {
    if (currentQuestion) {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleStrengthToggle = (strength: string) => {
    const current: string[] = answers.strengths || [];
    if (current.includes(strength)) {
      setAnswers({
        ...answers,
        strengths: current.filter((s: string) => s !== strength),
      });
    } else {
      setAnswers({ ...answers, strengths: [...current, strength] });
    }
  };

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!teamId) return;
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("로그인 필요");

      const { error } = await supabase.from("surveys").insert([
        {
          team_id: teamId,
          user_id: user.id,
          ...answers,
        },
      ]);

      if (error) throw error;

      router.push(`/team/${teamId}`);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("설문 제출 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / (questions.length + 1)) * 100;
  const currentAnswerValue = currentQuestion
    ? answers[currentQuestion.id as QuestionId]
    : undefined;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-3xl mx-auto px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Icon icon="weui:back-filled" width={26} height={26} />
          <span className="text-[15px] font-medium">뒤로</span>
        </button>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-gray-600">
              {step + 1} / {questions.length + 1}
            </span>
            <span className="text-[14px] font-medium text-[#0056a4]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0056a4] to-[#748d00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="p-10">
          {!isLastStep ? (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
                  <span className="text-[13px] text-[#0056a4] font-medium">
                    {currentQuestion.title}
                  </span>
                </div>
                <h2 className="text-[32px] font-bold mb-3">
                  {currentQuestion.question}
                </h2>
                <p className="text-[15px] text-gray-600">
                  가장 편하게 느껴지는 방식을 선택해주세요
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-5 border-2 rounded-lg text-left transition-all ${
                      currentAnswerValue === option.value
                        ? "border-[#0056a4] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-[18px] font-bold mb-1">
                      {option.label}
                    </div>
                    <div className="text-[14px] text-gray-600">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                    이전
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswerValue}
                  className="flex-1"
                >
                  다음
                  <Icon icon="mdi:arrow-right" className="text-xl" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
                  <span className="text-[13px] text-[#0056a4] font-medium">
                    마지막 질문
                  </span>
                </div>
                <h2 className="text-[32px] font-bold mb-3">
                  당신의 강점은 무엇인가요?
                </h2>
                <p className="text-[15px] text-gray-600">
                  팀에서 잘할 수 있는 영역을 모두 선택해주세요 (복수 선택 가능)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {strengthOptions.map((strength) => (
                  <button
                    key={strength}
                    onClick={() => handleStrengthToggle(strength)}
                    className={`p-4 border-2 rounded-lg text-[15px] font-medium transition-all ${
                      (answers.strengths || []).includes(strength)
                        ? "border-[#0056a4] bg-blue-50 text-[#0056a4]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {strength}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <Icon icon="mdi:arrow-left" className="text-xl" />
                  이전
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || (answers.strengths || []).length === 0}
                  className="flex-1"
                >
                  {loading ? "제출 중..." : "설문 완료"}
                  <Icon icon="mdi:check" className="text-xl" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] py-12 flex items-center justify-center">
          <div className="text-center">
            <Icon
              icon="mdi:loading"
              className="text-[48px] text-[#0056a4] animate-spin mx-auto mb-4"
            />
            <p className="text-[15px] text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <SurveyContent />
    </Suspense>
  );
}
