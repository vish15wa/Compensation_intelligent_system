import { NextResponse } from "next/server";
import { comparisonService } from "@/server/services/comparison.service";
import { rateLimit, getClientIp } from "@/lib/middleware/rateLimiter";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitCheck = rateLimit(ip);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const companies = searchParams.get("companies")
      ? searchParams.get("companies")!.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const levels = searchParams.get("levels")
      ? searchParams.get("levels")!.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const locations = searchParams.get("locations")
      ? searchParams.get("locations")!.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const result = await comparisonService.compareEntities({
      companies,
      levels,
      locations,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/compare error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare entities" },
      { status: 400 }
    );
  }
}
