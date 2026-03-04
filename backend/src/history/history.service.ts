import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    groupId?: string,
    from?: string,
    to?: string,
    page = 1,
    limit = 50,
  ) {
    const where: any = { userId };

    if (groupId) where.groupId = groupId;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.taskHistory.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.taskHistory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async reactivate(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: { group: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'ACTIVE', completedAt: null },
      }),
      this.prisma.taskHistory.create({
        data: {
          taskId,
          userId,
          groupId: task.groupId,
          groupName: task.group.name,
          taskTitle: task.title,
          action: 'REACTIVATED',
        },
      }),
    ]);

    return updatedTask;
  }
}
