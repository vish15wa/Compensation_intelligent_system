import prisma from "@/lib/prisma";

export class SavedComparisonRepository {
  async create(data: { userId: string; name: string; queryParams: string }) {
    return prisma.savedComparison.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.savedComparison.findUnique({
      where: { id },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.savedComparison.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}

export const savedComparisonRepository = new SavedComparisonRepository();
