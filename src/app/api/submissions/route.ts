import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { compensationService } from "@/server/services/compensation.service";
import { submissionSchema } from "@/lib/validations/schemas";
import { rateLimit, getClientIp } from "@/lib/middleware/rateLimiter";

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
    const body = await request.json();
    
    // Validate request body
    const validated = submissionSchema.parse(body);

    const result = await compensationService.submitCompensation(
      session?.user ? (session.user as any).id : undefined,
      validated
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/submissions error:", error);
    
    // Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit compensation details" },
      { status: 500 }
    );
  }
}
