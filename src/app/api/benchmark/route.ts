import { NextResponse } from "next/server";
import { benchmarkSchema } from "@/lib/validations/schemas";
import { compensationService } from "@/server/services/compensation.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = benchmarkSchema.parse(body);

    const result = await compensationService.getPercentile({
      company: parsed.company,
      role: parsed.role,
      level: parsed.level.toUpperCase(),
      totalCompensation: parsed.totalCompensation,
    });

    if (result.percentile === null) {
      return NextResponse.json({
        error: "Not enough data",
        message: "No matching entries found for the given criteria.",
        ...result,
      }, { status: 200 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
