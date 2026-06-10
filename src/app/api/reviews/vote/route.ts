import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : undefined;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) {
      return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: { reviewId, userId },
      },
    });

    if (existingVote) {
      await prisma.reviewVote.delete({ where: { id: existingVote.id } });
      await prisma.companyReview.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });
      return NextResponse.json({ voted: false });
    } else {
      await prisma.reviewVote.create({
        data: { reviewId, userId },
      });
      await prisma.companyReview.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      return NextResponse.json({ voted: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
