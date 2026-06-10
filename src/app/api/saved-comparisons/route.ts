import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { comparisonService } from "@/server/services/comparison.service";
import { savedComparisonSchema } from "@/lib/validations/schemas";
import { rateLimit, getClientIp } from "@/lib/middleware/rateLimiter";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const comparisons = await comparisonService.getSavedComparisons(userId);
    return NextResponse.json(comparisons);
  } catch (error: any) {
    console.error("GET /api/saved-comparisons error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch saved comparisons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limitCheck = rateLimit(ip);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    
    // Validate request
    const validated = savedComparisonSchema.parse(body);

    const queryParams = {
      companies: validated.companies,
      levels: validated.levels,
      locations: validated.locations,
    };

    const comparison = await comparisonService.saveComparison(
      userId,
      validated.name,
      queryParams
    );

    return NextResponse.json(comparison, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/saved-comparisons error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save comparison" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const result = await comparisonService.deleteSavedComparison(id, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DELETE /api/saved-comparisons error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete saved comparison" },
      { status: 500 }
    );
  }
}
