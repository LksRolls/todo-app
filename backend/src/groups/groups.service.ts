import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.group.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            tasks: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });
  }

  async create(userId: string, dto: CreateGroupDto) {
    const maxOrder = await this.prisma.group.aggregate({
      where: { userId },
      _max: { order: true },
    });

    return this.prisma.group.create({
      data: {
        userId,
        name: dto.name,
        color: dto.color || '#2d6a4f',
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateGroupDto) {
    await this.ensureOwnership(id, userId);
    return this.prisma.group.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.prisma.group.delete({ where: { id } });
  }

  private async ensureOwnership(id: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id, userId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }
}
