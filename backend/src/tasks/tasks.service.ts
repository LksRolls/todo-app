import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    groupId?: string,
    status?: TaskStatus,
  ) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(groupId && { groupId }),
        ...(status && { status }),
      },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    const maxOrder = await this.prisma.task.aggregate({
      where: { userId, groupId: dto.groupId, status: 'ACTIVE' },
      _max: { order: true },
    });

    return this.prisma.task.create({
      data: {
        userId,
        groupId: dto.groupId,
        title: dto.title,
        notes: dto.notes || null,
        priority: dto.priority || 'MEDIUM',
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.ensureOwnership(id, userId);

    // Track status changes in history
    if (dto.status && dto.status !== task.status) {
      const group = await this.prisma.group.findUnique({
        where: { id: task.groupId },
      });

      if (dto.status === 'COMPLETED') {
        await this.prisma.taskHistory.create({
          data: {
            taskId: id,
            userId,
            groupId: task.groupId,
            groupName: group?.name || '',
            taskTitle: task.title,
            action: 'COMPLETED',
          },
        });
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
        ...(dto.status === 'ACTIVE' && { completedAt: null }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }

  private async ensureOwnership(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
