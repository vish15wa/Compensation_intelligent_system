import { compensationRepository, SalaryFilters } from "../repositories/compensation.repository";
import { companyRepository } from "../repositories/company.repository";
import { roleRepository } from "../repositories/role.repository";
import { normalizeCompanyName } from "@/lib/utils/normalization";

export class CompensationService {
  async submitCompensation(
    userId: string | undefined,
    data: {
      company: string;
      role: string;
      level: string;
      location: string;
      yoe: number;
      yoeAtCompany: number;
      base: number;
      bonus: number;
      stock: number;
    }
  ) {
    // 1. Normalize company name
    const normalizedName = normalizeCompanyName(data.company);
    const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 2. Fetch or create company
    let company = await companyRepository.findByName(normalizedName);
    if (!company) {
      company = await companyRepository.create(normalizedName, slug);
    }

    // 3. Fetch or create role
    let role = await roleRepository.findByName(data.role);
    if (!role) {
      role = await roleRepository.create(data.role);
    }

    // 4. Calculate total compensation
    const totalCompensation = data.base + data.bonus + data.stock;

    // 5. Save compensation entry
    return compensationRepository.create({
      userId,
      companyId: company.id,
      roleId: role.id,
      level: data.level.toUpperCase(),
      location: data.location,
      yoe: data.yoe,
      yoeAtCompany: data.yoeAtCompany,
      base: data.base,
      bonus: data.bonus,
      stock: data.stock,
      totalCompensation,
    });
  }

  async searchSalaries(params: {
    filters: SalaryFilters;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    
    const [data, total] = await Promise.all([
      compensationRepository.findMany({
        filters: params.filters,
        skip,
        take: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }),
      compensationRepository.count(params.filters),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
      },
    };
  }

  async getPercentile(params: {
    company?: string;
    role?: string;
    level?: string;
    totalCompensation: number;
  }) {
    const entries = await compensationRepository.findForBenchmark({
      company: params.company,
      role: params.role,
      level: params.level,
    });

    const count = entries.length;

    if (count === 0) {
      return {
        percentile: null,
        totalEntries: 0,
        above: 0,
        below: 0,
        average: null,
        median: null,
        min: null,
        max: null,
        peerCount: 0,
      };
    }

    const below = entries.filter((e) => e.totalCompensation < params.totalCompensation).length;
    const percentile = Math.round((below / count) * 100);
    const above = count - below;

    const sorted = entries.map((e) => e.totalCompensation);
    const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / count);
    const median = sorted[Math.floor(count / 2)];

    return {
      percentile,
      totalEntries: count,
      above,
      below,
      average: avg,
      median,
      min: sorted[0],
      max: sorted[count - 1],
      peerCount: count,
    };
  }

  async getPercentileWithFallback(params: {
    company: string;
    role: string;
    level: string;
    totalCompensation: number;
  }) {
    // Tier 1: exact company + role + level
    let result = await this.getPercentile({
      company: params.company,
      role: params.role,
      level: params.level,
      totalCompensation: params.totalCompensation,
    });
    if (result.totalEntries > 0) return { ...result, matchLevel: "exact" as const };

    // Tier 2: company + role (any level)
    result = await this.getPercentile({
      company: params.company,
      role: params.role,
      totalCompensation: params.totalCompensation,
    });
    if (result.totalEntries > 0) return { ...result, matchLevel: "company+role" as const };

    // Tier 3: role + level (any company)
    result = await this.getPercentile({
      role: params.role,
      level: params.level,
      totalCompensation: params.totalCompensation,
    });
    if (result.totalEntries > 0) return { ...result, matchLevel: "role+level" as const };

    // Tier 4: company only
    result = await this.getPercentile({
      company: params.company,
      totalCompensation: params.totalCompensation,
    });
    if (result.totalEntries > 0) return { ...result, matchLevel: "company" as const };

    // Tier 5: role only
    result = await this.getPercentile({
      role: params.role,
      totalCompensation: params.totalCompensation,
    });
    if (result.totalEntries > 0) return { ...result, matchLevel: "role" as const };

    // Nothing found at all
    return { ...result, matchLevel: "none" as const };
  }

  async getCompanyAnalytics(slug: string) {
    const company = await companyRepository.findBySlug(slug);
    if (!company) {
      throw new Error(`Company with slug "${slug}" not found`);
    }

    const entries = await compensationRepository.findByCompanyId(company.id);
    if (entries.length === 0) {
      return {
        company,
        stats: { count: 0, avgTotal: 0, avgBase: 0, avgBonus: 0, avgStock: 0 },
        distribution: [],
        trends: [],
        roles: [],
        levels: [],
        locations: [],
      };
    }

    const count = entries.length;

    // Averages
    const totalSum = entries.reduce((s, e) => s + e.totalCompensation, 0);
    const baseSum = entries.reduce((s, e) => s + e.base, 0);
    const bonusSum = entries.reduce((s, e) => s + e.bonus, 0);
    const stockSum = entries.reduce((s, e) => s + e.stock, 0);

    const avgTotal = Math.round(totalSum / count);
    const avgBase = Math.round(baseSum / count);
    const avgBonus = Math.round(bonusSum / count);
    const avgStock = Math.round(stockSum / count);

    // Median
    const sortedTotal = [...entries].map((e) => e.totalCompensation).sort((a, b) => a - b);
    const medianTotal = sortedTotal[Math.floor(count / 2)];

    // 1. Salary Distribution (Bucketed by lakhs)
    // Buckets: 0-15L, 15-30L, 30-50L, 50-75L, 75-120L, 120L+
    const distributionBuckets = [
      { label: "0-15L", min: 0, max: 1500000, count: 0 },
      { label: "15-30L", min: 1500000, max: 3000000, count: 0 },
      { label: "30-50L", min: 3000000, max: 5000000, count: 0 },
      { label: "50-75L", min: 5000000, max: 7500000, count: 0 },
      { label: "75-120L", min: 7500000, max: 12000000, count: 0 },
      { label: "120L+", min: 12000000, max: Infinity, count: 0 },
    ];

    entries.forEach((e) => {
      const bucket = distributionBuckets.find((b) => e.totalCompensation >= b.min && e.totalCompensation < b.max);
      if (bucket) {
        bucket.count++;
      }
    });

    // 2. Compensation Trends (Grouped by month/year based on submittedAt)
    const trendsMap: Record<string, { total: number; count: number }> = {};
    entries.forEach((e) => {
      const date = new Date(e.submittedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // e.g. "2025-06"
      if (!trendsMap[key]) {
        trendsMap[key] = { total: 0, count: 0 };
      }
      trendsMap[key].total += e.totalCompensation;
      trendsMap[key].count++;
    });

    const trends = Object.entries(trendsMap)
      .map(([date, data]) => ({
        date,
        avgTotal: Math.round(data.total / data.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Top Paying Roles
    const rolesMap: Record<string, { total: number; count: number }> = {};
    entries.forEach((e) => {
      const rName = e.role.name;
      if (!rolesMap[rName]) {
        rolesMap[rName] = { total: 0, count: 0 };
      }
      rolesMap[rName].total += e.totalCompensation;
      rolesMap[rName].count++;
    });

    const roles = Object.entries(rolesMap)
      .map(([name, data]) => ({
        name,
        avgTotal: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgTotal - a.avgTotal);

    // 4. Level Breakdown
    const levelsMap: Record<string, { total: number; base: number; bonus: number; stock: number; count: number }> = {};
    entries.forEach((e) => {
      const lvl = e.level;
      if (!levelsMap[lvl]) {
        levelsMap[lvl] = { total: 0, base: 0, bonus: 0, stock: 0, count: 0 };
      }
      levelsMap[lvl].total += e.totalCompensation;
      levelsMap[lvl].base += e.base;
      levelsMap[lvl].bonus += e.bonus;
      levelsMap[lvl].stock += e.stock;
      levelsMap[lvl].count++;
    });

    const levels = Object.entries(levelsMap)
      .map(([level, data]) => ({
        level,
        avgTotal: Math.round(data.total / data.count),
        avgBase: Math.round(data.base / data.count),
        avgBonus: Math.round(data.bonus / data.count),
        avgStock: Math.round(data.stock / data.count),
        count: data.count,
      }))
      .sort((a, b) => a.level.localeCompare(b.level));

    // 5. Location Breakdown
    const locationsMap: Record<string, { total: number; count: number }> = {};
    entries.forEach((e) => {
      const loc = e.location;
      if (!locationsMap[loc]) {
        locationsMap[loc] = { total: 0, count: 0 };
      }
      locationsMap[loc].total += e.totalCompensation;
      locationsMap[loc].count++;
    });

    const locations = Object.entries(locationsMap)
      .map(([location, data]) => ({
        location,
        avgTotal: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgTotal - a.avgTotal);

    return {
      company,
      stats: {
        count,
        avgTotal,
        avgBase,
        avgBonus,
        avgStock,
        medianTotal,
      },
      distribution: distributionBuckets.map((b) => ({ label: b.label, count: b.count })),
      trends,
      roles,
      levels,
      locations,
    };
  }
}

export const compensationService = new CompensationService();
