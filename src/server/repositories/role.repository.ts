import prisma from "@/lib/prisma";

export class RoleRepository {
  async findByName(name: string) {
    return prisma.role.findFirst({
      where: {
        name: name,
      },
    });
  }

  async create(name: string) {
    return prisma.role.create({
      data: { name },
    });
  }

  async listAll() {
    return prisma.role.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const roleRepository = new RoleRepository();
