import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeTeamDynamics } from "@/lib/openai";

interface RoleSuggestion {
  member_index: number;
  suggested_role: string;
  reasoning: string;
  strengths: string[];
}

interface AnalysisResult {
  risk_score: number;
  risk_factors: unknown[];
  recommendations: unknown[];
  role_suggestions: RoleSuggestion[];
}

export async function POST(request: NextRequest) {
  try {
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    // Get all surveys for this team
    const { data: surveys, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("team_id", teamId);

    if (surveyError) throw surveyError;

    if (!surveys || surveys.length === 0) {
      return NextResponse.json(
        { error: "No surveys found for this team" },
        { status: 404 },
      );
    }

    // Analyze team dynamics using AI
    const analysis = (await analyzeTeamDynamics(surveys)) as AnalysisResult;

    // Map role suggestions to actual user IDs
    const roleSuggestions = analysis.role_suggestions.map(
      (suggestion: RoleSuggestion) => ({
        ...suggestion,
        user_id: surveys[suggestion.member_index]?.user_id,
      }),
    );

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("team_analysis")
      .insert([
        {
          team_id: teamId,
          risk_score: analysis.risk_score,
          risk_factors: analysis.risk_factors,
          recommendations: analysis.recommendations,
          role_suggestions: roleSuggestions,
        },
      ])
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
