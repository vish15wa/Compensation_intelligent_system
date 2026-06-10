import { compensationService } from "@/server/services/compensation.service";
import CompanyAnalytics from "@/components/companies/CompanyAnalytics";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic meta titles for companies
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const analytics = await compensationService.getCompanyAnalytics(slug);
    return {
      title: `${analytics.company.name} Compensation & Salaries | PayLens`,
      description: `View salary distribution, compensation trends, and level breakdowns at ${analytics.company.name}.`,
    };
  } catch {
    return {
      title: "Company Compensation Details | PayLens",
    };
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const analytics = await compensationService.getCompanyAnalytics(slug);
    return <CompanyAnalytics analytics={analytics as any} />;
  } catch (error) {
    console.error("Error loading company page:", error);
    return notFound();
  }
}
