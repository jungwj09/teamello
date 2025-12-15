"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TypeAnimation } from "react-type-animation";
import { getCurrentUser } from "@/lib/supabase";
import { AuthModal } from "@/components/auth/AuthModal";

interface User {
  id: string;
  email?: string;
}

const faqData = [
  {
    question: "팀원이 설문을 안 하면 어떻게 되나요?",
    answer:
      "모든 팀원이 설문해야 AI 분석이 시작됩니다. 초대 링크 재전송이 가능하니 팀원이 설문을 안 했다면 초대 링크를 재전송하세요.",
  },
  {
    question: "기여도는 어떤 기준으로 판단되나요?",
    answer: "팀원의 기록 + 일정 데이터 + 소통 패턴을 종합 분석합니다.",
  },
  {
    question: "감정 신호는 어떻게 파악하나요?",
    answer:
      "주간 체크인과 작업 패턴 기반입니다. 개인정보 내용은 수집하지 않습니다.",
  },
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqData.map((faq, index) => (
        <div key={index} className="border-b border-gray-200">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full py-4 md:py-6 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3 md:gap-4 flex-1 pr-4">
              <h3 className="text-[16px] md:text-[18px] font-bold">
                {faq.question}
              </h3>
            </div>
            <Icon
              icon={openIndex === index ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="text-[24px] md:text-[28px] text-gray-400 flex-shrink-0"
            />
          </button>
          {openIndex === index && (
            <div className="pb-4 md:pb-6">
              <p className="text-[14px] md:text-[15px] text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    checkUser();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="h-8 md:h-35"></div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-28 pb-16 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 rounded-full mb-6 md:mb-8">
          <Icon
            icon="mdi:sparkles"
            className="text-[#0056a4] text-base md:text-lg"
          />
          <span className="text-[12px] md:text-[14px] text-[#0056a4] font-medium">
            AI 기반 갈등 예방 시스템
          </span>
        </div>

        <h1 className="text-[32px] md:text-[64px] font-bold leading-tight mb-4 md:mb-6 px-2">
          팀플 갈등을{" "}
          <TypeAnimation
            sequence={["미리 예방하세요", 5000]}
            wrapper="span"
            speed={3}
            className="gradient-text"
            repeat={0}
            cursor={false}
          />
        </h1>

        <p className="text-[14px] md:text-[18px] text-gray-600 leading-relaxed mb-8 md:mb-12 px-4">
          Teamello는 팀 구성 초기부터 협업 리스크를 AI 분석으로 감지하고, 갈등을
          중재하여
          <br className="hidden md:block" />
          안정적인 팀 프로젝트를 가능하게 합니다.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 px-4">
          <Button
            className="text-[14px] md:text-[15px] w-full md:w-auto"
            onClick={handleGetStarted}
          >
            무료로 시작하기
            <Icon icon="mdi:arrow-right" className="text-xl" />
          </Button>
          <Button
            variant="outline"
            className="text-[14px] md:text-[15px] w-full md:w-auto"
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            데모 보기
          </Button>
        </div>
      </section>
      <div className="h-10 md:h-20"></div>

      {/* Features */}
      <section
        id="features"
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24"
      >
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[44px] font-bold mb-3 md:mb-4">
            Teamello의 핵심 기능
          </h2>
          <p className="text-[14px] md:text-[18px] text-gray-600">
            AI 기반 분석으로 팀 협업의 모든 단계를 지원합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="mdi:brain"
                className="text-[32px] md:text-[40px] text-[#0056a4]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              팀 성향 분석
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              설문을 통해 팀원의 협업 스타일, 역할 선호, 커뮤니케이션 방식을
              자동으로 분석합니다.
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="mdi:alert-circle-outline"
                className="text-[32px] md:text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              갈등 위험 예측
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              AI가 팀원 간 차이에서 발생할 수 있는 충돌 지점을 구체적으로
              제시합니다.
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="mdi:chart-bar"
                className="text-[32px] md:text-[40px] text-[#0056a4]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              리스크 진단 리포트
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              팀 상황에 맞춘 역할 배치, 일정 계획, 팀 규칙 템플릿을 자동으로
              추천합니다.
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="mdi:lightning-bolt"
                className="text-[32px] md:text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              실시간 모니터링
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              주간 체크인, 기여도 기록, 감정 신호를 분석하여 팀 상황 변화를
              지속적으로 추적합니다.
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="ic:baseline-people"
                className="text-[32px] md:text-[40px] text-[#0056a4]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              익명 중재 지원
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              일정 지연이나 소통 단절 등 조짐이 포착되면 AI가 즉시 중재를
              지원합니다.
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
              <Icon
                icon="mdi:file-document-outline"
                className="text-[32px] md:text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold mb-2 md:mb-3">
              자동 리포트 생성
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-600 leading-relaxed">
              프로젝트 종료 시 협업 기록을 종합한 PDF 리포트를 자동으로
              생성합니다.
            </p>
          </Card>
        </div>
      </section>

      {/* Process */}
      <section
        id="process"
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24"
      >
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[44px] font-bold mb-3 md:mb-4">
            Teamello 프로세스
          </h2>
          <p className="text-[14px] md:text-[18px] text-gray-600">
            팀 프로젝트 전 과정에서 어려움을 함께 해결해 나갑니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              number: "01",
              color: "#0056a4",
              title: "팀 구성",
              desc: "팀원들이 간단한 설문을 완료합니다.",
              detail:
                "협업 스타일, 일정 대응 태도, 소통 선호, 강점 영역 등을 입력",
            },
            {
              number: "02",
              color: "#748d00",
              title: "AI 진단",
              desc: "AI를 통한 협업 리스크 분석",
              detail:
                "팀원 간 차이에서 발생할 수 있는 충돌 지점을 구체적으로 제시",
            },
            {
              number: "03",
              color: "#0056a4",
              title: "권장사항 제공",
              desc: "팀 맞춤형 조치 계획 수립",
              detail: "역할 배치, 일정 계획, 팀 규칙 템플릿 자동 추천",
            },
            {
              number: "04",
              color: "#748d00",
              title: "협업 진행",
              desc: "주간 체크인과 기여도 기록",
              detail: "AI가 지속적으로 팀 상황 변화를 추적 및 분석",
            },
            {
              number: "05",
              color: "#0056a4",
              title: "갈등 조기 감지",
              desc: "일정 지연, 소통 단절 감지",
              detail: "AI 중재 가이드 및 대화 스크립트 즉시 제공",
            },
            {
              number: "06",
              color: "#748d00",
              title: "프로젝트 종료",
              desc: "협업 기록 종합 리포트 생성",
              detail: "수행평가, 조별과제 등 제출용 증빙 자료로 바로 활용 가능",
            },
          ].map((step, index) => (
            <Card key={index} className="p-6 md:p-8 relative">
              <div
                className="absolute top-4 md:top-6 right-4 md:right-6 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                style={{ backgroundColor: step.color }}
              ></div>
              <div
                className="text-[44px] md:text-[56px] font-bold mb-3 md:mb-4 leading-none"
                style={{ color: step.color }}
              >
                {step.number}
              </div>
              <h3 className="text-[18px] md:text-[20px] font-bold mb-1 md:mb-2">
                {step.title}
              </h3>
              <p className="text-[14px] md:text-[15px] font-medium text-gray-900 mb-1 md:mb-2">
                {step.desc}
              </p>
              <p className="text-[12px] md:text-[13px] text-gray-500 italic">
                {step.detail}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section
        id="reviews"
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24"
      >
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[44px] font-bold mb-3 md:mb-4">
            사용자들의 후기
          </h2>
          <p className="text-[14px] md:text-[18px] text-gray-600">
            Teamello로 팀 협업의 변화를 경험한 학생들입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              review:
                "Teamello가 없었으면 팀이 완전히 흩어졌을 것 같아요. AI가 미리 우리의 차이점을 알려줘서 갈등이 생기기 전에 대비할 수 있었어요.",
              name: "김현민",
              grade: "고등학교 1학년",
              project: "수행평가 팀프로젝트",
            },
            {
              review:
                "리더로서 팀 관리가 정말 힘들었는데, Teamello의 데이터 기반 제안이 정말 도움됐습니다. 객관적 근거로 팀을 운영할 수 있게 되었어요.",
              name: "Jino",
              grade: "대학생",
              project: "전공 프로젝트",
            },
            {
              review:
                "처음 팀프로젝트라서 불안했는데, Teamello의 설문과 피드백이 저한테 역할을 명확하게 해줬어요. 심리적으로 훨씬 편했어요.",
              name: "정선우",
              grade: "중학생",
              project: "동아리 활동",
            },
          ].map((item, index) => (
            <Card key={index} className="p-6 md:p-8">
              <div className="flex gap-1 mb-3 md:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    icon="mdi:star"
                    className="text-[18px] md:text-[20px] text-[#748d00]"
                  />
                ))}
              </div>
              <p className="text-[14px] md:text-[15px] text-gray-700 leading-relaxed mb-4 md:mb-6">
                &quot;{item.review}&quot;
              </p>
              <div className="border-t border-gray-100 pt-3 md:pt-4">
                <p className="text-[14px] md:text-[15px] font-bold text-gray-900">
                  {item.name}
                </p>
                <p className="text-[12px] md:text-[13px] text-gray-600">
                  {item.grade}
                </p>
                <p className="text-[12px] md:text-[13px] text-gray-500">
                  {item.project}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24"
      >
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[44px] font-bold mb-3 md:mb-4">
            자주 묻는 질문
          </h2>
          <p className="text-[14px] md:text-[18px] text-gray-600">
            Teamello에 대해 궁금한 점을 확인하세요
          </p>
        </div>

        <FAQAccordion />
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24">
        <Card className="max-w-4xl mx-auto p-8 md:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 rounded-full mb-4 md:mb-6">
            <Icon
              icon="mdi:lightning-bolt"
              className="text-[#0056a4] text-base md:text-lg"
            />
            <span className="text-[12px] md:text-[14px] text-[#0056a4] font-medium">
              지금 바로 시작하세요
            </span>
          </div>

          <h2 className="text-[28px] md:text-[40px] font-bold mb-4 md:mb-6 leading-tight px-2">
            갈등 없는 팀플의 시작
          </h2>
          <p className="text-[14px] md:text-[16px] text-gray-600 leading-relaxed mb-6 md:mb-10 px-2">
            Teamello와 함께 성공적인 팀 프로젝트를 경험하세요. 초기 진단부터
            프로젝트 종료까지,
            <br className="hidden md:block" />
            모든 과정에서 어려움을 지원합니다.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-4 md:mb-6 px-4">
            <Button
              className="text-[14px] md:text-[15px] w-full md:w-auto"
              onClick={handleGetStarted}
            >
              지금 무료로 시작
              <Icon icon="mdi:arrow-right" className="text-xl" />
            </Button>
            <Button
              variant="outline"
              className="text-[14px] md:text-[15px] w-full md:w-auto"
            >
              문의하기
            </Button>
          </div>

          <p className="text-[12px] md:text-[13px] text-gray-500 px-4">
            결제 없이 3분만에 무료로 시작할 수 있습니다. 추가 팀이 필요하면
            언제든 업그레이드하세요.
          </p>
        </Card>
      </section>
      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </div>
  );
}
