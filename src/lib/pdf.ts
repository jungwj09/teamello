import { TeamAnalysis } from "@/types/analysis";
import { Team, TeamMember } from "@/types/team";

interface CheckInData {
  id: string;
  mood: string;
  progress: number;
  challenges: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export async function generatePDFReport(
  team: Team,
  analysis: TeamAnalysis,
  members: TeamMember[],
  checkins: CheckInData[],
): Promise<void> {
  // HTML 기반 PDF 생성 (브라우저 print 기능 활용)
  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${team.name} - 팀 협업 리포트</title>
  <style>
    @page { margin: 2cm; }
    body {
      font-family: 'Malgun Gothic', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #0056a4;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0056a4;
      font-size: 32px;
      margin: 0;
    }
    .header p {
      color: #666;
      margin: 10px 0 0 0;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      color: #0056a4;
      border-bottom: 2px solid #748d00;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .risk-score {
      text-align: center;
      padding: 30px;
      background: #f0f8ff;
      border-radius: 10px;
      margin: 20px 0;
    }
    .risk-score .score {
      font-size: 72px;
      font-weight: bold;
      color: #0056a4;
    }
    .risk-factor {
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #748d00;
      background: #f9f9f9;
    }
    .risk-factor.high {
      border-left-color: #dc3545;
      background: #fff5f5;
    }
    .risk-factor.medium {
      border-left-color: #ffc107;
      background: #fffbf0;
    }
    .recommendation {
      padding: 15px;
      margin: 10px 0;
      background: #f0f8ff;
      border-radius: 5px;
    }
    .member-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .member-card {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${team.name}</h1>
    <p>팀 협업 분석 리포트</p>
    <p>생성일: ${new Date().toLocaleDateString("ko-KR")}</p>
  </div>

  <div class="section">
    <h2 class="section-title">1. 종합 위험도 평가</h2>
    <div class="risk-score">
      <div class="score">${analysis.risk_score}</div>
      <p>${
        analysis.risk_score < 30
          ? "매우 안정적인 팀입니다"
          : analysis.risk_score < 60
            ? "일부 주의가 필요합니다"
            : "적극적인 관리가 필요합니다"
      }</p>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">2. 팀 구성원</h2>
    <div class="member-list">
      ${members
        .map(
          (m) => `
        <div class="member-card">
          <strong>${m.user?.name || "알 수 없음"}</strong>
          <br/>
          <small>${m.user?.email || ""}</small>
          <br/>
          <span style="background: #0056a4; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">
            ${m.role}
          </span>
        </div>
      `,
        )
        .join("")}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">3. 위험 요소</h2>
    ${analysis.risk_factors
      .map(
        (factor) => `
      <div class="risk-factor ${factor.severity}">
        <strong>${factor.category}</strong>
        <span style="float: right; background: ${
          factor.severity === "high"
            ? "#dc3545"
            : factor.severity === "medium"
              ? "#ffc107"
              : "#28a745"
        }; color: white; padding: 2px 10px; border-radius: 3px; font-size: 12px;">
          ${factor.severity === "high" ? "높음" : factor.severity === "medium" ? "중간" : "낮음"}
        </span>
        <p>${factor.description}</p>
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="section">
    <h2 class="section-title">4. 권장 조치사항</h2>
    ${analysis.recommendations
      .map(
        (rec, idx) => `
      <div class="recommendation">
        <strong>${idx + 1}. ${rec.title}</strong>
        <p>${rec.description}</p>
        <ul>
          ${rec.actions.map((action) => `<li>${action}</li>`).join("")}
        </ul>
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="section">
    <h2 class="section-title">5. 추천 역할 배치</h2>
    ${analysis.role_suggestions
      .map((suggestion) => {
        const member = members.find((m) => m.user);
        return `
      <div class="recommendation">
        <strong>${member?.user?.name || "팀원"} - ${suggestion.suggested_role}</strong>
        <p>${suggestion.reasoning}</p>
        <p><strong>강점:</strong> ${suggestion.strengths.join(", ")}</p>
      </div>
    `;
      })
      .join("")}
  </div>

  <div class="section">
    <h2 class="section-title">6. 최근 체크인 활동</h2>
    <p>총 ${checkins.length}회의 체크인이 진행되었습니다.</p>
    ${checkins
      .slice(0, 5)
      .map(
        (c) => `
      <div class="member-card" style="margin: 10px 0;">
        <strong>${c.user?.name || "익명"}</strong> - ${new Date(c.created_at).toLocaleDateString("ko-KR")}
        <br/>
        진행률: ${c.progress}% | 기분: ${c.mood}
        ${c.challenges ? `<br/><em>"${c.challenges}"</em>` : ""}
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="footer">
    <p>본 리포트는 Teamello AI 기반 팀 분석 시스템으로 생성되었습니다.</p>
    <p>${team.name} | ${new Date().toLocaleDateString("ko-KR")}</p>
  </div>
</body>
</html>
  `;

  // 새 창에서 열고 인쇄 대화상자 표시
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();

    // 로딩 대기 후 인쇄
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

export function downloadPDFReport(
  team: Team,
  analysis: TeamAnalysis,
  members: TeamMember[],
  checkins: CheckInData[],
): void {
  generatePDFReport(team, analysis, members, checkins);
}
