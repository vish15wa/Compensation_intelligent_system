import { NextResponse } from "next/server";
import { compensationService } from "@/server/services/compensation.service";
import { z } from "zod";

const offerSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  level: z.string().min(1),
  base: z.number().gt(0),
  bonus: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  location: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = offerSchema.parse(body);

    const totalCompensation = parsed.base + parsed.bonus + parsed.stock;

    const [percentileResult, companyAnalytics] = await Promise.all([
      compensationService.getPercentileWithFallback({
        company: parsed.company,
        role: parsed.role,
        level: parsed.level.toUpperCase(),
        totalCompensation,
      }),
      compensationService.getCompanyAnalytics(parsed.company.toLowerCase().replace(/\s+/g, "-")).catch(() => null),
    ]);

    const avgByRole = percentileResult.average
      ? totalCompensation - percentileResult.average
      : null;

    let score = 0;
    if (percentileResult.percentile !== null) {
      if (percentileResult.percentile >= 90) score = 5;
      else if (percentileResult.percentile >= 65) score = 4;
      else if (percentileResult.percentile >= 35) score = 3;
      else score = 2;
    }

    let recommendation: string;
    if (percentileResult.totalEntries === 0) {
      recommendation = "No market data available for this role yet.";
    } else if (score >= 5) {
      recommendation = "Excellent offer — well above market average.";
    } else if (score >= 4) {
      recommendation = "Strong offer — above market average.";
    } else if (score >= 3) {
      recommendation = "Fair offer — in line with market.";
    } else {
      recommendation = "Below market average — consider negotiating.";
    }

    const breakdown = {
      base: parsed.base,
      bonus: parsed.bonus,
      stock: parsed.stock,
      total: totalCompensation,
      basePct: Math.round((parsed.base / totalCompensation) * 100),
      bonusPct: Math.round((parsed.bonus / totalCompensation) * 100),
      stockPct: Math.round((parsed.stock / totalCompensation) * 100),
    };

    return NextResponse.json({
      score,
      percentile: percentileResult.percentile,
      totalPeers: percentileResult.totalEntries,
      matchLevel: percentileResult.matchLevel,
      marketComparison: {
        average: percentileResult.average,
        median: percentileResult.median,
        min: percentileResult.min,
        max: percentileResult.max,
        differenceFromAvg: avgByRole,
        isAboveAverage: avgByRole !== null ? avgByRole > 0 : null,
      },
      breakdown,
      companyAvgTotal: companyAnalytics?.stats.avgTotal || null,
      recommendation,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
