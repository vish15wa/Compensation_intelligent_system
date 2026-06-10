import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  companyId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(200),
  pros: z.string().min(1).max(5000),
  cons: z.string().min(1).max(5000),
  isCurrentEmployee: z.boolean().default(true),
  designation: z.string().optional(),
  location: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const includeAll = searchParams.get("all") === "true";

  const where: any = {};
  if (companyId) where.companyId = companyId;
  if (!includeAll) where.status = "APPROVED";

  const reviews = await prisma.companyReview.findMany({
    where,
    include: {
      company: { select: { name: true, slug: true } },
      user: { select: { name: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: reviews });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@paylens.io");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  await prisma.companyReview.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@paylens.io");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const review = await prisma.companyReview.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(review);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    const review = await prisma.companyReview.create({
      data: {
        companyId: parsed.companyId,
        userId: session?.user ? (session.user as any).id : undefined,
        rating: parsed.rating,
        title: parsed.title,
        pros: parsed.pros,
        cons: parsed.cons,
        isCurrentEmployee: parsed.isCurrentEmployee,
        designation: parsed.designation,
        location: parsed.location,
        isAnonymous: parsed.isAnonymous,
      },
      include: {
        company: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
