"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const steps = [
  {
    title: "Teamello에 오신 것을 환영합니다!",
    description:
      "팀 프로젝트의 갈등을 예방하고 원활한 협업을 지원하는 AI 플랫폼입니다.",
    icon: "mdi:hand-wave",
    color: "#0056a4",
  },
  {
    title: "팀을 만들고 팀원을 초대하세요",
    description: "프로젝트 팀을 생성하고 팀원들을 이메일로 초대할 수 있습니다.",
    icon: "mdi:account-group",
    color: "#748d00",
  },
  {
    title: "협업 성향 설문을 완료하세요",
    description:
      "간단한 설문으로 업무 스타일, 소통 방식, 강점 영역을 파악합니다.",
    icon: "mdi:clipboard-text",
    color: "#0056a4",
  },
  {
    title: "AI 분석 리포트를 확인하세요",
    description:
      "팀의 갈등 위험 요소를 예측하고 맞춤형 권장사항을 제공받습니다.",
    icon: "mdi:chart-line",
    color: "#748d00",
  },
  {
    title: "주간 체크인으로 팀을 관리하세요",
    description:
      "정기적인 체크인으로 팀 상태를 모니터링하고 조기에 문제를 해결합니다.",
    icon: "mdi:calendar-check",
    color: "#0056a4",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-12">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Icon
              icon={currentStepData.icon}
              className="text-[80px] mx-auto"
              style={{ color: currentStepData.color }}
            />
          </div>
          <h1 className="text-[36px] font-bold mb-4">
            {currentStepData.title}
          </h1>
          <p className="text-[16px] text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-[#0056a4]"
                    : index < currentStep
                      ? "w-2 bg-[#748d00]"
                      : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            건너뛰기
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {currentStep === steps.length - 1 ? "시작하기" : "다음"}
            <Icon icon="mdi:arrow-right" className="text-xl" />
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[13px] text-gray-500">
            {currentStep + 1} / {steps.length}
          </p>
        </div>
      </Card>
    </div>
  );
}
