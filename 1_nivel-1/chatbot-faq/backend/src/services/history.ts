import { PrismaClient } from "../generated/prisma";

export class HistoryService {
  constructor(private prisma: PrismaClient) {}

  async upsertSession(sessionId: string): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: sessionId },
      create: { id: sessionId },
      update: {},
    });
  }

  async saveMessage(sessionId: string, role: string, content: string): Promise<void> {
    await this.prisma.message.create({
      data: { sessionId, role, content },
    });
  }

  async getHistory(sessionId: string) {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true, createdAt: true },
    });
  }
}
