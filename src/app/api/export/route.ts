import { NextResponse } from "next/server";
import { compensationRepository } from "@/server/repositories/compensation.repository";
import { rateLimit, getClientIp } from "@/lib/middleware/rateLimiter";
import prisma from "@/lib/prisma";

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
    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const level = searchParams.get("level");
    const location = searchParams.get("location");

    const where: any = {};
    if (company) where.company = { name: { contains: company } };
    if (role) where.role = { name: role };
    if (level) where.level = level;
    if (location) where.location = location;

    const allEntries = await prisma.compensationEntry.findMany({
      where,
      include: { company: true, role: true },
      orderBy: { submittedAt: "desc" },
    });

    const headers = [
      "Company", "Role", "Level", "Location",
      "Total YOE", "YOE at Company",
      "Base Salary", "Bonus", "Stock/yr",
      "Total Compensation", "Currency", "Submitted At"
    ].join(",");

    const rows = allEntries.map((e) =>
      [
        escapeCsv(e.company.name),
        escapeCsv(e.role.name),
        escapeCsv(e.level),
        escapeCsv(e.location),
        e.yoe,
        e.yoeAtCompany,
        e.base,
        e.bonus,
        e.stock,
        e.totalCompensation,
        e.currency,
        e.submittedAt.toISOString().split("T")[0],
      ].join(",")
    );

    const csv = [headers, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="compensation-data-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/export error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
