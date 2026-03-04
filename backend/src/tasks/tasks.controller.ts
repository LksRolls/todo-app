import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('groupId') groupId?: string,
    @Query('status') status?: TaskStatus,
  ) {
    const user = req.user as any;
    const data = await this.tasksService.findAll(user.id, groupId, status);
    return { statusCode: 200, message: 'Success', data };
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const user = req.user as any;
    const data = await this.tasksService.create(user.id, dto);
    return { statusCode: 201, message: 'Task created', data };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const user = req.user as any;
    const data = await this.tasksService.update(id, user.id, dto);
    return { statusCode: 200, message: 'Task updated', data };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    await this.tasksService.remove(id, user.id);
    return { statusCode: 200, message: 'Task deleted', data: null };
  }
}
