import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const benefitSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const where: any = {};
  if (companyId) where.companyId = companyId;

  const benefits = await prisma.companyBenefit.findMany({
    where,
    include: {
      company: { select: { name: true, slug: true } },
    },
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ data: benefits });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = benefitSchema.parse(body);

    const existing = await prisma.companyBenefit.findUnique({
      where: { companyId_name: { companyId: parsed.companyId, name: parsed.name } },
    });

    if (existing) {
      return NextResponse.json({ error: "Benefit already exists for this company" }, { status: 409 });
    }

    const benefit = await prisma.companyBenefit.create({
      data: parsed,
      include: {
        company: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(benefit, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
