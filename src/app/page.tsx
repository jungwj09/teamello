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
            className="w-full py-6 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-4 flex-1">
              <h3 className="text-[18px] font-bold">{faq.question}</h3>
            </div>
            <Icon
              icon={openIndex === index ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="text-[28px] text-gray-400 flex-shrink-0"
            />
          </button>
          {openIndex === index && (
              <p className="text-[15px] text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
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
      <div className="h-30"></div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-8 pt-28 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8">
          <Icon icon="mdi:sparkles" className="text-[#0056a4] text-lg" />
          <span className="text-[14px] text-[#0056a4] font-medium">
            AI 기반 갈등 예방 시스템
          </span>
        </div>

        <h1 className="text-[64px] font-bold leading-tight mb-6">
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

        <p className="text-[18px] text-gray-600 leading-relaxed mb-12">
          Teamello는 팀 구성 초기부터 협업 리스크를 AI 분석으로 감지하고, 갈등을
          중재하여
          <br />
          안정적인 팀 프로젝트를 가능하게 합니다.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button className="text-[15px]" onClick={handleGetStarted}>
            무료로 시작하기
            <Icon icon="mdi:arrow-right" className="text-xl" />
          </Button>
          <Button
            variant="outline"
            className="text-[15px]"
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
      <div className="h-20"></div>

      {/* Features */}
      <section id="features" className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-[44px] font-bold mb-4">Teamello의 핵심 기능</h2>
          <p className="text-[18px] text-gray-600">
            AI 기반 분석으로 팀 협업의 모든 단계를 지원합니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon icon="mdi:brain" className="text-[40px] text-[#0056a4]" />
            </div>
            <h3 className="text-[20px] font-bold mb-3">팀 성향 분석</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              설문을 통해 팀원의 협업 스타일, 역할 선호, 커뮤니케이션 방식을
              자동으로 분석합니다.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon
                icon="mdi:alert-circle-outline"
                className="text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[20px] font-bold mb-3">갈등 위험 예측</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              AI가 팀원 간 차이에서 발생할 수 있는 충돌 지점을 구체적으로
              제시합니다.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon
                icon="mdi:chart-bar"
                className="text-[40px] text-[#0056a4]"
              />
            </div>
            <h3 className="text-[20px] font-bold mb-3">리스크 진단 리포트</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              팀 상황에 맞춘 역할 배치, 일정 계획, 팀 규칙 템플릿을 자동으로
              추천합니다.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon
                icon="mdi:lightning-bolt"
                className="text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[20px] font-bold mb-3">실시간 모니터링</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              주간 체크인, 기여도 기록, 감정 신호를 분석하여 팀 상황 변화를
              지속적으로 추적합니다.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon
                icon="ic:baseline-people"
                className="text-[40px] text-[#0056a4]"
              />
            </div>
            <h3 className="text-[20px] font-bold mb-3">익명 중재 지원</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              일정 지연이나 소통 단절 등 조짐이 포착되면 AI가 즉시 중재를
              지원합니다.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 flex items-center justify-center mb-6">
              <Icon
                icon="mdi:file-document-outline"
                className="text-[40px] text-[#748d00]"
              />
            </div>
            <h3 className="text-[20px] font-bold mb-3">자동 리포트 생성</h3>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              프로젝트 종료 시 협업 기록을 종합한 PDF 리포트를 자동으로
              생성합니다.
            </p>
          </Card>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-[44px] font-bold mb-4">Teamello 프로세스</h2>
          <p className="text-[18px] text-gray-600">
            팀 프로젝트 전 과정에서 어려움을 함께 해결해 나갑니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#0056a4] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#0056a4] mb-4 leading-none">
              01
            </div>
            <h3 className="text-[20px] font-bold mb-2">팀 구성</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              팀원들이 간단한 설문을 완료합니다.
            </p>
            <p className="text-[13px] text-gray-500 italic">
              협업 스타일, 일정 대응 태도, 소통 선호, 강점 영역 등을 입력
            </p>
          </Card>

          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#748d00] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#748d00] mb-4 leading-none">
              02
            </div>
            <h3 className="text-[20px] font-bold mb-2">AI 진단</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              AI를 통한 협업 리스크 분석
            </p>
            <p className="text-[13px] text-gray-500 italic">
              팀원 간 차이에서 발생할 수 있는 충돌 지점을 구체적으로 제시
            </p>
          </Card>

          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#0056a4] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#0056a4] mb-4 leading-none">
              03
            </div>
            <h3 className="text-[20px] font-bold mb-2">권장사항 제공</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              팀 맞춤형 조치 계획 수립
            </p>
            <p className="text-[13px] text-gray-500 italic">
              역할 배치, 일정 계획, 팀 규칙 템플릿 자동 추천
            </p>
          </Card>

          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#748d00] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#748d00] mb-4 leading-none">
              04
            </div>
            <h3 className="text-[20px] font-bold mb-2">협업 진행</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              주간 체크인과 기여도 기록
            </p>
            <p className="text-[13px] text-gray-500 italic">
              AI가 지속적으로 팀 상황 변화를 추적 및 분석
            </p>
          </Card>

          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#0056a4] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#0056a4] mb-4 leading-none">
              05
            </div>
            <h3 className="text-[20px] font-bold mb-2">갈등 조기 감지</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              일정 지연, 소통 단절 감지
            </p>
            <p className="text-[13px] text-gray-500 italic">
              AI 중재 가이드 및 대화 스크립트 즉시 제공
            </p>
          </Card>

          <Card className="p-8 relative">
            <div className="absolute top-6 right-6 w-3 h-3 bg-[#748d00] rounded-full"></div>
            <div className="text-[56px] font-bold text-[#748d00] mb-4 leading-none">
              06
            </div>
            <h3 className="text-[20px] font-bold mb-2">프로젝트 종료</h3>
            <p className="text-[15px] font-medium text-gray-900 mb-2">
              협업 기록 종합 리포트 생성
            </p>
            <p className="text-[13px] text-gray-500 italic">
              수행평가, 조별과제 등 제출용 증빙 자료로 바로 활용 가능
            </p>
          </Card>
        </div>
      </section>

      <section id="reviews" className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-[44px] font-bold mb-4">사용자들의 후기</h2>
          <p className="text-[18px] text-gray-600">
            Teamello로 팀 협업의 변화를 경험한 학생들입니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="mdi:star"
                  className="text-[20px] text-[#748d00]"
                />
              ))}
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
              &quot;Teamello가 없었으면 팀이 완전히 흩어졌을 것 같아요. AI가
              미리 우리의 차이점을 알려줘서 갈등이 생기기 전에 대비할 수
              있었어요.&quot;
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[15px] font-bold text-gray-900">김현민</p>
              <p className="text-[13px] text-gray-600">고등학교 1학년</p>
              <p className="text-[13px] text-gray-500">수행평가 팀프로젝트</p>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="mdi:star"
                  className="text-[20px] text-[#748d00]"
                />
              ))}
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
              &quot;리더로서 팀 관리가 정말 힘들었는데, Teamello의 데이터 기반
              제안이 정말 도움됐습니다. 객관적 근거로 팀을 운영할 수 있게
              되었어요.&quot;
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[15px] font-bold text-gray-900">Jino</p>
              <p className="text-[13px] text-gray-600">대학생</p>
              <p className="text-[13px] text-gray-500">전공 프로젝트</p>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="mdi:star"
                  className="text-[20px] text-[#748d00]"
                />
              ))}
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
              &quot;처음 팀프로젝트라서 불안했는데, Teamello의 설문과 피드백이
              저한테 역할을 명확하게 해줬어요. 심리적으로 훨씬 편했어요.&quot;
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[15px] font-bold text-gray-900">정선우</p>
              <p className="text-[13px] text-gray-600">중학생</p>
              <p className="text-[13px] text-gray-500">동아리 활동</p>
            </div>
          </Card>
        </div>
      </section>

      <section id="faq" className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-[44px] font-bold mb-4">자주 묻는 질문</h2>
          <p className="text-[18px] text-gray-600">
            Teamello에 대해 궁금한 점을 확인하세요
          </p>
        </div>

        <FAQAccordion />
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-8 py-24">
        <Card className="max-w-4xl mx-auto p-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <Icon
              icon="mdi:lightning-bolt"
              className="text-[#0056a4] text-lg"
            />
            <span className="text-[14px] text-[#0056a4] font-medium">
              지금 바로 시작하세요
            </span>
          </div>

          <h2 className="text-[40px] font-bold mb-6 leading-tight">
            갈등 없는 팀플의 시작
          </h2>
          <p className="text-[16px] text-gray-600 leading-relaxed mb-10">
            Teamello와 함께 성공적인 팀 프로젝트를 경험하세요. 초기 진단부터
            프로젝트 종료까지,
            <br />
            모든 과정에서 어려움을 지원합니다.
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <Button className="text-[15px]" onClick={handleGetStarted}>
              지금 무료로 시작
              <Icon icon="mdi:arrow-right" className="text-xl" />
            </Button>
            <Button variant="outline" className="text-[15px]">
              문의하기
            </Button>
          </div>

          <p className="text-[13px] text-gray-500">
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
