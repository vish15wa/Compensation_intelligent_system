import { NextResponse } from "next/server";
import { companyService } from "@/server/services/company.service";

export async function GET() {
  try {
    const companies = await companyService.getAllCompanies();
    return NextResponse.json(companies);
  } catch (error: any) {
    console.error("GET /api/companies error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
