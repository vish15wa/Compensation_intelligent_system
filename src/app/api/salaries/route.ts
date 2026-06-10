import { NextResponse } from "next/server";
import { compensationService } from "@/server/services/compensation.service";
import { queryFilterSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query filters
    const queryObj = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      level: searchParams.get("level") || undefined,
      location: searchParams.get("location") || undefined,
      yoe: searchParams.get("yoe") || undefined,
      sortBy: searchParams.get("sortBy") || "submittedAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const parsed = queryFilterSchema.parse(queryObj);

    const result = await compensationService.searchSalaries({
      filters: {
        search: parsed.search,
        role: parsed.role,
        level: parsed.level,
        location: parsed.location,
        yoe: parsed.yoe,
      },
      page: parsed.page,
      limit: parsed.limit,
      sortBy: parsed.sortBy,
      sortOrder: parsed.sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/salaries error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch salaries" },
      { status: 400 }
    );
  }
}
