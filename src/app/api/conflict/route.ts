import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { detectConflictRisk } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    // 최근 체크인 데이터 가져오기 (최근 20개)
    const { data: checkins, error: checkinError } = await supabase
      .from("checkins")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (checkinError) throw checkinError;

    if (!checkins || checkins.length === 0) {
      return NextResponse.json(
        {
          success: true,
          analysis: {
            risk_level: "none",
            concerns: [],
            intervention_needed: false,
            suggested_actions: ["팀원들에게 첫 체크인을 권장하세요"],
          },
        },
        { status: 200 },
      );
    }

    // AI로 갈등 위험 분석
    const analysis = await detectConflictRisk(checkins);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Conflict Detection Error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
