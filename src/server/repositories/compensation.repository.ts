import prisma from "@/lib/prisma";

export interface SalaryFilters {
  search?: string;
  role?: string;
  level?: string;
  location?: string;
  yoe?: number;
}

export class CompensationRepository {
  async create(data: {
    userId?: string;
    companyId: string;
    roleId: string;
    level: string;
    location: string;
    yoe: number;
    yoeAtCompany: number;
    base: number;
    bonus: number;
    stock: number;
    totalCompensation: number;
  }) {
    return prisma.compensationEntry.create({
      data,
      include: {
        company: true,
        role: true,
      },
    });
  }

  buildWhereClause(filters: SalaryFilters) {
    const where: any = {};

    if (filters.search) {
      where.company = {
        name: {
          contains: filters.search,
        },
      };
    }

    if (filters.role) {
      where.role = {
        name: filters.role,
      };
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.location) {
      where.location = filters.location;
    }

    if (filters.yoe !== undefined) {
      where.yoe = filters.yoe;
    }

    return where;
  }

  async findMany(params: {
    filters: SalaryFilters;
    skip: number;
    take: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }) {
    const where = this.buildWhereClause(params.filters);
    
    // Default sorting handling
    let orderBy: any = {};
    if (params.sortBy === "company") {
      orderBy = { company: { name: params.sortOrder } };
    } else if (params.sortBy === "role") {
      orderBy = { role: { name: params.sortOrder } };
    } else {
      orderBy = { [params.sortBy]: params.sortOrder };
    }

    return prisma.compensationEntry.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: {
        company: true,
        role: true,
      },
    });
  }

  async count(filters: SalaryFilters) {
    const where = this.buildWhereClause(filters);
    return prisma.compensationEntry.count({ where });
  }

  async findByCompanyId(companyId: string) {
    return prisma.compensationEntry.findMany({
      where: { companyId },
      include: {
        company: true,
        role: true,
      },
      orderBy: { submittedAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return prisma.compensationEntry.findMany({
      where: { userId },
      include: {
        company: true,
        role: true,
      },
      orderBy: { submittedAt: "desc" },
    });
  }

  async findForBenchmark(params: {
    company?: string;
    role?: string;
    level?: string;
  }) {
    const where: any = {};

    if (params.company) {
      where.company = { name: params.company };
    }

    if (params.role) {
      where.role = { name: params.role };
    }

    if (params.level) {
      where.level = params.level;
    }

    return prisma.compensationEntry.findMany({
      where,
      include: { company: true, role: true },
      orderBy: { totalCompensation: "asc" },
    });
  }

  async findRawCompareData(params: {
    companies: string[];
    levels: string[];
    locations: string[];
  }) {
    const where: any = {};
    
    if (params.companies.length > 0) {
      where.company = {
        name: { in: params.companies }
      };
    }
    
    if (params.levels.length > 0) {
      where.level = { in: params.levels };
    }

    if (params.locations.length > 0) {
      where.location = { in: params.locations };
    }

    return prisma.compensationEntry.findMany({
      where,
      include: {
        company: true,
        role: true,
      },
    });
  }
}

export const compensationRepository = new CompensationRepository();
