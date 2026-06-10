import { NextResponse } from "next/server";
import { compensationService } from "@/server/services/compensation.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }

    const analytics = await compensationService.getCompanyAnalytics(slug);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("GET /api/companies/[slug]/analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company analytics" },
      { status: 404 }
    );
  }
}
