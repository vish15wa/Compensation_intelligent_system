import prisma from "@/lib/prisma";

export class CompanyRepository {
  async findByName(name: string) {
    return prisma.company.findFirst({
      where: {
        name: name,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.company.findUnique({
      where: { slug: slug.toLowerCase() },
    });
  }

  async create(name: string, slug: string) {
    return prisma.company.create({
      data: {
        name,
        slug: slug.toLowerCase(),
      },
    });
  }

  async listAll() {
    return prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { compensations: true }
        }
      }
    });
  }
}

export const companyRepository = new CompanyRepository();
