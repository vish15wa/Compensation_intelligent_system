import { queryFilterSchema } from "@/lib/validations/schemas";
import { compensationService } from "@/server/services/compensation.service";
import BenchmarkCalculator from "@/components/benchmark/BenchmarkCalculator";
import SearchFilters from "@/components/filters/SearchFilters";
import SalaryTable from "@/components/tables/SalaryTable";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/normalization";
import { Building2, Globe, IndianRupee, Users } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const parsed = queryFilterSchema.parse({
    search: resolvedParams.search || undefined,
    role: resolvedParams.role || undefined,
    level: resolvedParams.level || undefined,
    location: resolvedParams.location || undefined,
    yoe: resolvedParams.yoe || undefined,
    sortBy: resolvedParams.sortBy || "submittedAt",
    sortOrder: resolvedParams.sortOrder || "desc",
    page: resolvedParams.page || "1",
    limit: resolvedParams.limit || "20",
  });

  const { data, pagination } = await compensationService.searchSalaries({
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

  const statsAggregate = await prisma.compensationEntry.aggregate({
    _count: true,
    _avg: { totalCompensation: true },
    _max: { totalCompensation: true },
  });

  const uniqueCompanies = await prisma.company.count();

  const totalSubmissions = statsAggregate._count || 0;
  const averageSalary = statsAggregate._avg.totalCompensation || 0;
  const maxSalary = statsAggregate._max.totalCompensation || 0;

  return (
    <div className="space-y-10 flex flex-col pb-16">
      {/* Page Header */}
      <div className="space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Salaries & Analytics
        </h1>
        <p className="text-sm sm:text-base text-charcoal max-w-2xl">
          Browse, filter, and benchmark crowdsourced tech compensation data from top companies in India.
        </p>
      </div>

      {/* Benchmark Tool */}
      <BenchmarkCalculator />

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white/80 border-olive">
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-bronze/10 p-2 text-bronze border border-bronze/20 shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Submissions</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-foreground">{totalSubmissions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-sage/10 p-2 text-muted-foreground border border-sage/20 shrink-0">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Avg Package</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-foreground">{formatINR(averageSalary)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20 shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Companies</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-foreground">{uniqueCompanies}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="rounded-lg bg-bronze/10 p-2 text-bronze border border-bronze/20 shrink-0">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Highest</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5 text-foreground">{formatINR(maxSalary)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          All Submissions
        </h2>
        <SearchFilters />
        <SalaryTable data={data as any} pagination={pagination} />
      </div>
    </div>
  );
}
